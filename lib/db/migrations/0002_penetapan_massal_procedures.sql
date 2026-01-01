-- ============================================================================
-- PENETAPAN MASSAL - Stored Procedures for PBB Tax Assessment
-- Fresh implementation based on SISMIOP reference
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PENENTUAN_KELAS - Determine property class from NJOP per m2
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penentuan_kelas(
  IN p_flag_jenis BIGINT,         -- 1 = land (tanah), 2 = building (bangunan)
  IN p_thn_pajak TEXT,            -- Tax year (e.g., '2024')
  IN p_nilai_per_m2 BIGINT,       -- Value per m2 in Rupiah
  INOUT p_kd_kelas TEXT,          -- Output: class code
  INOUT p_thn_awal_kls TEXT,      -- Output: class start year
  INOUT p_njop_per_m2 BIGINT      -- Output: NJOP per m2
)
LANGUAGE plpgsql AS $$
DECLARE
  v_nilai_para DECIMAL(15,2);
BEGIN
  -- Convert to thousands (table stores values in thousands)
  v_nilai_para := p_nilai_per_m2 / 1000.0;

  IF p_nilai_per_m2 > 0 THEN
    IF p_flag_jenis = 1 THEN
      -- Land class lookup
      BEGIN
        SELECT kd_kls_tanah, nilai_per_m2_tanah, thn_awal_kls_tanah
        INTO STRICT p_kd_kelas, p_njop_per_m2, p_thn_awal_kls
        FROM kelas_tanah
        WHERE thn_awal_kls_tanah <= p_thn_pajak
          AND thn_akhir_kls_tanah >= p_thn_pajak
          AND nilai_min_tanah < v_nilai_para
          AND nilai_max_tanah >= v_nilai_para
          AND kd_kls_tanah NOT IN ('XXX', '00');
      EXCEPTION
        WHEN OTHERS THEN
          p_njop_per_m2 := v_nilai_para::BIGINT;
          p_kd_kelas := 'XXX';
          p_thn_awal_kls := '1986';
      END;
    ELSIF p_flag_jenis = 2 THEN
      -- Building class lookup
      BEGIN
        SELECT kd_kls_bng, nilai_per_m2_bng, thn_awal_kls_bng
        INTO STRICT p_kd_kelas, p_njop_per_m2, p_thn_awal_kls
        FROM kelas_bangunan
        WHERE thn_awal_kls_bng <= p_thn_pajak
          AND thn_akhir_kls_bng >= p_thn_pajak
          AND nilai_min_bng < v_nilai_para
          AND nilai_max_bng >= v_nilai_para
          AND kd_kls_bng NOT IN ('XXX', '00');
      EXCEPTION
        WHEN OTHERS THEN
          p_njop_per_m2 := v_nilai_para::BIGINT;
          p_kd_kelas := 'XXX';
          p_thn_awal_kls := '1986';
      END;
    END IF;
    -- Convert back from thousands
    p_njop_per_m2 := p_njop_per_m2 * 1000;
  ELSE
    p_njop_per_m2 := 0;
    p_kd_kelas := 'XXX';
    p_thn_awal_kls := '1986';
  END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. PENILAIAN_BUMI - Calculate land value for a single land component
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penilaian_bumi(
  IN p_kd_propinsi CHAR(2),
  IN p_kd_dati2 CHAR(2),
  IN p_kd_kecamatan CHAR(3),
  IN p_kd_kelurahan CHAR(3),
  IN p_kd_blok CHAR(3),
  IN p_no_urut CHAR(4),
  IN p_kd_jns_op CHAR(1),
  IN p_no_bumi SMALLINT,
  IN p_kd_znt CHAR(2),
  IN p_luas_bumi BIGINT,
  IN p_tahun CHAR(4),
  IN p_flag_update BIGINT,        -- 1 = update dat_op_bumi, 0 = read only
  INOUT p_nilai_bumi BIGINT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_nir DECIMAL(15,2) := 0;
BEGIN
  -- For special property types (7,8), use land class directly
  IF p_kd_jns_op IN ('7', '8') THEN
    BEGIN
      SELECT COALESCE(nilai_per_m2_tanah, 0)
      INTO STRICT v_nir
      FROM kelas_tanah
      WHERE RPAD(kd_kls_tanah, 3) = RPAD(p_kd_znt, 3);
    EXCEPTION
      WHEN OTHERS THEN v_nir := 0;
    END;
  ELSE
    -- Normal case: lookup NIR from dat_nir
    BEGIN
      SELECT nir
      INTO STRICT v_nir
      FROM dat_nir
      WHERE kd_propinsi = p_kd_propinsi
        AND kd_dati2 = p_kd_dati2
        AND kd_kecamatan = p_kd_kecamatan
        AND kd_kelurahan = p_kd_kelurahan
        AND kd_znt = p_kd_znt
        AND thn_nir_znt = p_tahun;
    EXCEPTION
      WHEN OTHERS THEN v_nir := 0;
    END;
  END IF;

  -- Calculate land value: luas * NIR
  p_nilai_bumi := p_luas_bumi * COALESCE(v_nir, 0);

  -- Optionally update dat_op_bumi
  IF p_flag_update = 1 THEN
    UPDATE dat_op_bumi
    SET nilai_sistem_bumi = ROUND(p_nilai_bumi)
    WHERE kd_propinsi = p_kd_propinsi
      AND kd_dati2 = p_kd_dati2
      AND kd_kecamatan = p_kd_kecamatan
      AND kd_kelurahan = p_kd_kelurahan
      AND kd_blok = p_kd_blok
      AND no_urut = p_no_urut
      AND kd_jns_op = p_kd_jns_op
      AND no_bumi = p_no_bumi;
  END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. PENILAIAN_BNG - Calculate building value for a single building
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penilaian_bng(
  IN p_kd_propinsi CHAR(2),
  IN p_kd_dati2 CHAR(2),
  IN p_kd_kecamatan CHAR(3),
  IN p_kd_kelurahan CHAR(3),
  IN p_kd_blok CHAR(3),
  IN p_no_urut CHAR(4),
  IN p_kd_jns_op CHAR(1),
  IN p_no_bng SMALLINT,
  IN p_tahun CHAR(4),
  IN p_flag_update BIGINT,
  INOUT p_nilai_bng BIGINT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_nilai_individu BIGINT := 0;
  v_nilai_sistem BIGINT := 0;
BEGIN
  -- Check for individual valuation first
  BEGIN
    SELECT nilai_individu
    INTO STRICT v_nilai_individu
    FROM dat_nilai_individu
    WHERE kd_propinsi = p_kd_propinsi
      AND kd_dati2 = p_kd_dati2
      AND kd_kecamatan = p_kd_kecamatan
      AND kd_kelurahan = p_kd_kelurahan
      AND kd_blok = p_kd_blok
      AND no_urut = p_no_urut
      AND kd_jns_op = p_kd_jns_op
      AND no_bng = p_no_bng;
  EXCEPTION
    WHEN OTHERS THEN v_nilai_individu := 0;
  END;

  -- If individual valuation exists, use it
  IF v_nilai_individu > 0 THEN
    p_nilai_bng := v_nilai_individu;
  ELSE
    -- Use system value from dat_op_bangunan
    BEGIN
      SELECT COALESCE(nilai_sistem_bng, 0)
      INTO STRICT v_nilai_sistem
      FROM dat_op_bangunan
      WHERE kd_propinsi = p_kd_propinsi
        AND kd_dati2 = p_kd_dati2
        AND kd_kecamatan = p_kd_kecamatan
        AND kd_kelurahan = p_kd_kelurahan
        AND kd_blok = p_kd_blok
        AND no_urut = p_no_urut
        AND kd_jns_op = p_kd_jns_op
        AND no_bng = p_no_bng;
    EXCEPTION
      WHEN OTHERS THEN v_nilai_sistem := 0;
    END;
    p_nilai_bng := v_nilai_sistem;
  END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. PENENTUAN_NJOP_BUMI - Calculate total land NJOP for a property
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penentuan_njop_bumi(
  IN p_kd_propinsi CHAR(2),
  IN p_kd_dati2 CHAR(2),
  IN p_kd_kecamatan CHAR(3),
  IN p_kd_kelurahan CHAR(3),
  IN p_kd_blok CHAR(3),
  IN p_no_urut CHAR(4),
  IN p_kd_jns_op CHAR(1),
  IN p_tahun CHAR(4),
  INOUT p_total_luas_bumi BIGINT,
  INOUT p_total_nilai_bumi BIGINT,
  INOUT p_njop_bumi_per_m2 BIGINT,
  INOUT p_kd_kls_tanah TEXT,
  INOUT p_thn_awal_kls_tanah TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_rec RECORD;
  v_nilai_bumi BIGINT;
  v_njop_per_m2 BIGINT;
BEGIN
  p_total_luas_bumi := 0;
  p_total_nilai_bumi := 0;

  -- Loop through all land components
  FOR v_rec IN
    SELECT no_bumi, kd_znt, luas_bumi
    FROM dat_op_bumi
    WHERE kd_propinsi = p_kd_propinsi
      AND kd_dati2 = p_kd_dati2
      AND kd_kecamatan = p_kd_kecamatan
      AND kd_kelurahan = p_kd_kelurahan
      AND kd_blok = p_kd_blok
      AND no_urut = p_no_urut
      AND kd_jns_op = p_kd_jns_op
  LOOP
    v_nilai_bumi := 0;
    CALL penilaian_bumi(
      p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
      p_kd_blok, p_no_urut, p_kd_jns_op, v_rec.no_bumi,
      v_rec.kd_znt, v_rec.luas_bumi, p_tahun, 1, v_nilai_bumi
    );

    p_total_luas_bumi := p_total_luas_bumi + v_rec.luas_bumi;
    p_total_nilai_bumi := p_total_nilai_bumi + v_nilai_bumi;
  END LOOP;

  -- Calculate NJOP per m2 and determine class
  IF p_total_luas_bumi > 0 THEN
    p_njop_bumi_per_m2 := ROUND(p_total_nilai_bumi::DECIMAL / p_total_luas_bumi);
  ELSE
    p_njop_bumi_per_m2 := 0;
  END IF;

  -- Determine land class
  v_njop_per_m2 := 0;
  CALL penentuan_kelas(1, p_tahun, p_njop_bumi_per_m2, p_kd_kls_tanah, p_thn_awal_kls_tanah, v_njop_per_m2);

  -- Recalculate NJOP based on class
  p_total_nilai_bumi := p_total_luas_bumi * v_njop_per_m2;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. PENENTUAN_NJOP_BNG - Calculate total building NJOP for a property
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penentuan_njop_bng(
  IN p_kd_propinsi CHAR(2),
  IN p_kd_dati2 CHAR(2),
  IN p_kd_kecamatan CHAR(3),
  IN p_kd_kelurahan CHAR(3),
  IN p_kd_blok CHAR(3),
  IN p_no_urut CHAR(4),
  IN p_kd_jns_op CHAR(1),
  IN p_tahun CHAR(4),
  INOUT p_total_luas_bng BIGINT,
  INOUT p_total_nilai_bng BIGINT,
  INOUT p_njop_bng_per_m2 BIGINT,
  INOUT p_kd_kls_bng TEXT,
  INOUT p_thn_awal_kls_bng TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_rec RECORD;
  v_nilai_bng BIGINT;
  v_njop_per_m2 BIGINT;
BEGIN
  p_total_luas_bng := 0;
  p_total_nilai_bng := 0;

  -- Loop through all building components
  FOR v_rec IN
    SELECT no_bng, luas_bng
    FROM dat_op_bangunan
    WHERE kd_propinsi = p_kd_propinsi
      AND kd_dati2 = p_kd_dati2
      AND kd_kecamatan = p_kd_kecamatan
      AND kd_kelurahan = p_kd_kelurahan
      AND kd_blok = p_kd_blok
      AND no_urut = p_no_urut
      AND kd_jns_op = p_kd_jns_op
  LOOP
    v_nilai_bng := 0;
    CALL penilaian_bng(
      p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
      p_kd_blok, p_no_urut, p_kd_jns_op, v_rec.no_bng,
      p_tahun, 0, v_nilai_bng
    );

    p_total_luas_bng := p_total_luas_bng + v_rec.luas_bng;
    p_total_nilai_bng := p_total_nilai_bng + v_nilai_bng;
  END LOOP;

  -- Calculate NJOP per m2 and determine class
  IF p_total_luas_bng > 0 THEN
    p_njop_bng_per_m2 := ROUND(p_total_nilai_bng::DECIMAL / p_total_luas_bng);
  ELSE
    p_njop_bng_per_m2 := 0;
  END IF;

  -- Determine building class
  v_njop_per_m2 := 0;
  CALL penentuan_kelas(2, p_tahun, p_njop_bng_per_m2, p_kd_kls_bng, p_thn_awal_kls_bng, v_njop_per_m2);

  -- Recalculate NJOP based on class
  p_total_nilai_bng := p_total_luas_bng * v_njop_per_m2;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. GET_PENGURANGAN - Get total reduction percentage for a property
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_pengurangan(
  p_kd_propinsi CHAR(2),
  p_kd_dati2 CHAR(2),
  p_kd_kecamatan CHAR(3),
  p_kd_kelurahan CHAR(3),
  p_kd_blok CHAR(3),
  p_no_urut CHAR(4),
  p_kd_jns_op CHAR(1),
  p_thn_pajak CHAR(4)
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_pct_pst DECIMAL(5,2) := 0;
  v_pct_permanen DECIMAL(5,2) := 0;
  v_pct_jpb DECIMAL(5,2) := 0;
BEGIN
  -- Get PST reduction
  BEGIN
    SELECT COALESCE(MAX(pct_pengurangan_pst), 0)
    INTO v_pct_pst
    FROM pengurangan_pst
    WHERE kd_propinsi_pemohon = p_kd_propinsi
      AND kd_dati2_pemohon = p_kd_dati2
      AND kd_kecamatan_pemohon = p_kd_kecamatan
      AND kd_kelurahan_pemohon = p_kd_kelurahan
      AND kd_blok_pemohon = p_kd_blok
      AND no_urut_pemohon = p_no_urut
      AND kd_jns_op_pemohon = p_kd_jns_op
      AND thn_peng_pst = p_thn_pajak
      AND status_sk_peng_pst = '1';
  EXCEPTION
    WHEN OTHERS THEN v_pct_pst := 0;
  END;

  -- Get permanent reduction
  BEGIN
    SELECT COALESCE(MAX(pct_pengurangan_permanen), 0)
    INTO v_pct_permanen
    FROM pengurangan_permanen
    WHERE kd_propinsi_pemohon = p_kd_propinsi
      AND kd_dati2_pemohon = p_kd_dati2
      AND kd_kecamatan_pemohon = p_kd_kecamatan
      AND kd_kelurahan_pemohon = p_kd_kelurahan
      AND kd_blok_pemohon = p_kd_blok
      AND no_urut_pemohon = p_no_urut
      AND kd_jns_op_pemohon = p_kd_jns_op
      AND thn_peng_permanen_awal <= p_thn_pajak
      AND thn_peng_permanen_akhir >= p_thn_pajak
      AND status_sk_peng_permanen = '1';
  EXCEPTION
    WHEN OTHERS THEN v_pct_permanen := 0;
  END;

  -- Get JPB reduction
  BEGIN
    SELECT COALESCE(MAX(pct_pengurangan_jpb), 0)
    INTO v_pct_jpb
    FROM pengurangan_pengenaan_jpb
    WHERE kd_propinsi_pemohon = p_kd_propinsi
      AND kd_dati2_pemohon = p_kd_dati2
      AND kd_kecamatan_pemohon = p_kd_kecamatan
      AND kd_kelurahan_pemohon = p_kd_kelurahan
      AND kd_blok_pemohon = p_kd_blok
      AND no_urut_pemohon = p_no_urut
      AND kd_jns_op_pemohon = p_kd_jns_op
      AND thn_pengenaan_jpb = p_thn_pajak;
  EXCEPTION
    WHEN OTHERS THEN v_pct_jpb := 0;
  END;

  -- Return highest reduction (they don't stack)
  RETURN GREATEST(v_pct_pst, v_pct_permanen, v_pct_jpb);
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 7. PENETAPAN_MASSAL - Main tax assessment procedure
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penetapan_massal(
  -- NOP parameters
  IN p_kd_propinsi CHAR(2),
  IN p_kd_dati2 CHAR(2),
  IN p_kd_kecamatan CHAR(3),
  IN p_kd_kelurahan CHAR(3),
  IN p_kd_blok CHAR(3),
  IN p_no_urut CHAR(4),
  IN p_kd_jns_op CHAR(1),
  -- Tax parameters
  IN p_thn_pajak CHAR(4),
  IN p_njoptkp BIGINT,            -- NJOPTKP value (e.g., 12000000)
  IN p_tarif DECIMAL(5,2),        -- Tax rate (e.g., 0.10 for 0.1%)
  -- Bank/payment info
  IN p_kd_kanwil CHAR(2),
  IN p_kd_kppbb CHAR(2),
  IN p_kd_bank_tunggal CHAR(2),
  IN p_kd_bank_persepsi CHAR(2),
  IN p_kd_tp CHAR(2),
  -- Due date
  IN p_tgl_jatuh_tempo TIMESTAMP,
  -- Officer info
  IN p_nip_pencetak CHAR(18)
)
LANGUAGE plpgsql AS $$
DECLARE
  -- Property data
  v_subjek_pajak_id CHAR(30);
  v_nm_wp VARCHAR(30);
  v_jln_wp VARCHAR(30);
  v_blok_kav_no_wp VARCHAR(15);
  v_rw_wp CHAR(2);
  v_rt_wp CHAR(3);
  v_kelurahan_wp VARCHAR(30);
  v_kota_wp VARCHAR(30);
  v_kd_pos_wp VARCHAR(5);
  v_npwp VARCHAR(16);
  v_no_persil VARCHAR(5);
  -- Land values
  v_luas_bumi BIGINT := 0;
  v_njop_bumi BIGINT := 0;
  v_njop_bumi_per_m2 BIGINT := 0;
  v_kd_kls_tanah TEXT := 'XXX';
  v_thn_awal_kls_tanah TEXT := '1986';
  -- Building values
  v_luas_bng BIGINT := 0;
  v_njop_bng BIGINT := 0;
  v_njop_bng_per_m2 BIGINT := 0;
  v_kd_kls_bng TEXT := 'XXX';
  v_thn_awal_kls_bng TEXT := '1986';
  -- Tax calculation
  v_njop_total BIGINT;
  v_njoptkp_applied BIGINT;
  v_njkp DECIMAL(5,2);
  v_pbb_terhutang BIGINT;
  v_pct_pengurangan DECIMAL(5,2);
  v_faktor_pengurang BIGINT;
  v_pbb_yg_harus_dibayar BIGINT;
  v_siklus SMALLINT := 1;
BEGIN
  -- Get taxpayer data
  BEGIN
    SELECT
      o.subjek_pajak_id,
      COALESCE(s.nm_wp, 'PEMILIK'),
      COALESCE(s.jalan_wp, '-'),
      s.blok_kav_no_wp,
      s.rw_wp,
      s.rt_wp,
      s.kelurahan_wp,
      s.kota_wp,
      s.kd_pos_wp,
      s.npwp,
      o.no_persil
    INTO STRICT
      v_subjek_pajak_id,
      v_nm_wp,
      v_jln_wp,
      v_blok_kav_no_wp,
      v_rw_wp,
      v_rt_wp,
      v_kelurahan_wp,
      v_kota_wp,
      v_kd_pos_wp,
      v_npwp,
      v_no_persil
    FROM dat_objek_pajak o
    LEFT JOIN dat_subjek_pajak s ON o.subjek_pajak_id = s.subjek_pajak_id
    WHERE o.kd_propinsi = p_kd_propinsi
      AND o.kd_dati2 = p_kd_dati2
      AND o.kd_kecamatan = p_kd_kecamatan
      AND o.kd_kelurahan = p_kd_kelurahan
      AND o.kd_blok = p_kd_blok
      AND o.no_urut = p_no_urut
      AND o.kd_jns_op = p_kd_jns_op;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'NOP not found: %.%.%.%.%.%.%',
        p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
        p_kd_blok, p_no_urut, p_kd_jns_op;
  END;

  -- Calculate land NJOP
  CALL penentuan_njop_bumi(
    p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
    p_kd_blok, p_no_urut, p_kd_jns_op, p_thn_pajak,
    v_luas_bumi, v_njop_bumi, v_njop_bumi_per_m2,
    v_kd_kls_tanah, v_thn_awal_kls_tanah
  );

  -- Calculate building NJOP
  CALL penentuan_njop_bng(
    p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
    p_kd_blok, p_no_urut, p_kd_jns_op, p_thn_pajak,
    v_luas_bng, v_njop_bng, v_njop_bng_per_m2,
    v_kd_kls_bng, v_thn_awal_kls_bng
  );

  -- Calculate total NJOP
  v_njop_total := v_njop_bumi + v_njop_bng;

  -- Apply NJOPTKP (only if NJOP > NJOPTKP)
  IF v_njop_total > p_njoptkp THEN
    v_njoptkp_applied := p_njoptkp;
  ELSE
    v_njoptkp_applied := v_njop_total;
  END IF;

  -- Calculate NJKP (taxable value)
  v_njkp := (v_njop_total - v_njoptkp_applied)::DECIMAL / v_njop_total * 100;
  IF v_njkp < 0 THEN v_njkp := 0; END IF;

  -- Calculate PBB Terhutang
  v_pbb_terhutang := ROUND((v_njop_total - v_njoptkp_applied) * p_tarif / 100);
  IF v_pbb_terhutang < 0 THEN v_pbb_terhutang := 0; END IF;

  -- Get reduction percentage
  v_pct_pengurangan := get_pengurangan(
    p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
    p_kd_blok, p_no_urut, p_kd_jns_op, p_thn_pajak
  );

  -- Calculate reduction amount
  v_faktor_pengurang := ROUND(v_pbb_terhutang * v_pct_pengurangan / 100);

  -- Calculate final PBB
  v_pbb_yg_harus_dibayar := v_pbb_terhutang - v_faktor_pengurang;
  IF v_pbb_yg_harus_dibayar < 0 THEN v_pbb_yg_harus_dibayar := 0; END IF;

  -- Get existing siklus or default to 1
  BEGIN
    SELECT COALESCE(MAX(siklus_sppt), 0) + 1
    INTO v_siklus
    FROM sppt
    WHERE kd_propinsi = p_kd_propinsi
      AND kd_dati2 = p_kd_dati2
      AND kd_kecamatan = p_kd_kecamatan
      AND kd_kelurahan = p_kd_kelurahan
      AND kd_blok = p_kd_blok
      AND no_urut = p_no_urut
      AND kd_jns_op = p_kd_jns_op
      AND thn_pajak_sppt = p_thn_pajak;
  EXCEPTION
    WHEN OTHERS THEN v_siklus := 1;
  END;

  -- Insert or update SPPT
  INSERT INTO sppt (
    kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan,
    kd_blok, no_urut, kd_jns_op, thn_pajak_sppt,
    siklus_sppt,
    kd_kanwil_bank, kd_kppbb_bank, kd_bank_tunggal, kd_bank_persepsi, kd_tp,
    nm_wp_sppt, jln_wp_sppt, blok_kav_no_wp_sppt,
    rw_wp_sppt, rt_wp_sppt, kelurahan_wp_sppt, kota_wp_sppt,
    kd_pos_wp_sppt, npwp_sppt, no_persil_sppt,
    kd_kls_tanah, thn_awal_kls_tanah, kd_kls_bng, thn_awal_kls_bng,
    tgl_jatuh_tempo_sppt,
    luas_bumi_sppt, luas_bng_sppt,
    njop_bumi_sppt, njop_bng_sppt, njop_sppt,
    njoptkp_sppt, njkp_sppt,
    pbb_terhutang_sppt, faktor_pengurang_sppt, pbb_yg_harus_dibayar_sppt,
    status_pembayaran_sppt, status_tagihan_sppt, status_cetak_sppt,
    tgl_terbit_sppt, tgl_cetak_sppt, nip_pencetak_sppt
  ) VALUES (
    p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
    p_kd_blok, p_no_urut, p_kd_jns_op, p_thn_pajak,
    v_siklus,
    p_kd_kanwil, p_kd_kppbb, p_kd_bank_tunggal, p_kd_bank_persepsi, p_kd_tp,
    v_nm_wp, v_jln_wp, v_blok_kav_no_wp,
    v_rw_wp, v_rt_wp, v_kelurahan_wp, v_kota_wp,
    v_kd_pos_wp, v_npwp, v_no_persil,
    v_kd_kls_tanah, v_thn_awal_kls_tanah, v_kd_kls_bng, v_thn_awal_kls_bng,
    p_tgl_jatuh_tempo,
    v_luas_bumi, v_luas_bng,
    v_njop_bumi, v_njop_bng, v_njop_total,
    v_njoptkp_applied, v_njkp,
    v_pbb_terhutang, v_faktor_pengurang, v_pbb_yg_harus_dibayar,
    '0', '0', '0',
    NOW(), NOW(), p_nip_pencetak
  )
  ON CONFLICT (kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan,
               kd_blok, no_urut, kd_jns_op, thn_pajak_sppt)
  DO UPDATE SET
    siklus_sppt = v_siklus,
    kd_kanwil_bank = p_kd_kanwil,
    kd_kppbb_bank = p_kd_kppbb,
    kd_bank_tunggal = p_kd_bank_tunggal,
    kd_bank_persepsi = p_kd_bank_persepsi,
    kd_tp = p_kd_tp,
    nm_wp_sppt = v_nm_wp,
    jln_wp_sppt = v_jln_wp,
    blok_kav_no_wp_sppt = v_blok_kav_no_wp,
    rw_wp_sppt = v_rw_wp,
    rt_wp_sppt = v_rt_wp,
    kelurahan_wp_sppt = v_kelurahan_wp,
    kota_wp_sppt = v_kota_wp,
    kd_pos_wp_sppt = v_kd_pos_wp,
    npwp_sppt = v_npwp,
    no_persil_sppt = v_no_persil,
    kd_kls_tanah = v_kd_kls_tanah,
    thn_awal_kls_tanah = v_thn_awal_kls_tanah,
    kd_kls_bng = v_kd_kls_bng,
    thn_awal_kls_bng = v_thn_awal_kls_bng,
    tgl_jatuh_tempo_sppt = p_tgl_jatuh_tempo,
    luas_bumi_sppt = v_luas_bumi,
    luas_bng_sppt = v_luas_bng,
    njop_bumi_sppt = v_njop_bumi,
    njop_bng_sppt = v_njop_bng,
    njop_sppt = v_njop_total,
    njoptkp_sppt = v_njoptkp_applied,
    njkp_sppt = v_njkp,
    pbb_terhutang_sppt = v_pbb_terhutang,
    faktor_pengurang_sppt = v_faktor_pengurang,
    pbb_yg_harus_dibayar_sppt = v_pbb_yg_harus_dibayar,
    tgl_terbit_sppt = NOW(),
    tgl_cetak_sppt = NOW(),
    nip_pencetak_sppt = p_nip_pencetak;

  -- Update dat_objek_pajak with calculated values
  UPDATE dat_objek_pajak
  SET total_luas_bumi = v_luas_bumi,
      total_luas_bng = v_luas_bng,
      njop_bumi = v_njop_bumi,
      njop_bng = v_njop_bng
  WHERE kd_propinsi = p_kd_propinsi
    AND kd_dati2 = p_kd_dati2
    AND kd_kecamatan = p_kd_kecamatan
    AND kd_kelurahan = p_kd_kelurahan
    AND kd_blok = p_kd_blok
    AND no_urut = p_no_urut
    AND kd_jns_op = p_kd_jns_op;

  COMMIT;
END;
$$;

-- ============================================================================
-- END OF PENETAPAN MASSAL PROCEDURES
-- ============================================================================
