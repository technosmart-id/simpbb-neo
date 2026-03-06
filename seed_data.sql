-- Insert Subjek Pajak (Owner)
INSERT INTO dat_subjek_pajak (
    subjek_pajak_id,
    nm_wp,
    jalan_wp,
    status_pekerjaan_wp
) VALUES (
    '337410000100000000000000000001',
    'TEST USER',
    'JL TEST NO 1',
    '1'
) ON CONFLICT (subjek_pajak_id) DO NOTHING;

-- Insert Objek Pajak (Property)
INSERT INTO dat_objek_pajak (
    kd_propinsi,
    kd_dati2,
    kd_kecamatan,
    kd_kelurahan,
    kd_blok,
    no_urut,
    kd_jns_op,
    subjek_pajak_id,
    no_formulir_spop,
    jalan_op,
    kd_status_cabang,
    kd_status_wp,
    total_luas_bumi,
    total_luas_bng,
    njop_bumi,
    njop_bng,
    status_peta_op,
    jns_transaksi_op,
    tgl_pendataan_op,
    nip_pendata,
    tgl_pemeriksaan_op,
    nip_pemeriksa_op,
    tgl_perekaman_op,
    nip_perekam_op
) VALUES (
    '33', '74', '010', '001', '001', '0001', '0',
    '337410000100000000000000000001',
    'SPOP00001',
    'JL OP TEST NO 1',
    1,
    '1',
    100, -- Luas Bumi
    200, -- Luas Bangunan
    100000000, -- NJOP Bumi
    200000000, -- NJOP Bangunan
    0,
    '1',
    NOW(),
    'NIP001',
    NOW(),
    'NIP002',
    NOW(),
    'NIP003'
) ON CONFLICT (kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan, kd_blok, no_urut, kd_jns_op) DO NOTHING;

-- Insert SPPT (Current Year 2026 - necessary for "pbbTerutang" and "statusBayar")
INSERT INTO sppt (
    kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan, kd_blok, no_urut, kd_jns_op,
    thn_pajak_sppt,
    siklus_sppt,
    kd_kanwil_bank, kd_kppbb_bank, kd_bank_tunggal, kd_bank_persepsi, kd_tp,
    nm_wp_sppt, jln_wp_sppt,
    tgl_jatuh_tempo_sppt,
    luas_bumi_sppt, luas_bng_sppt,
    njop_bumi_sppt, njop_bng_sppt,
    njop_sppt, njoptkp_sppt,
    pbb_terhutang_sppt, pbb_yg_harus_dibayar_sppt,
    status_pembayaran_sppt, status_tagihan_sppt, status_cetak_sppt,
    tgl_terbit_sppt,
    nip_pencetak_sppt
) VALUES (
    '33', '74', '010', '001', '001', '0001', '0',
    '2026',
    1,
    '01', '01', '01', '01', '01',
    'TEST USER', 'JL TEST NO 1',
    '2026-12-31',
    100, 200,
    100000000, 200000000,
    300000000, 10000000,
    150000, 150000, -- PBB Terutang
    '0', '0', '0', -- Status Bayar (0=Belum)
    NOW(),
    'ADMIN'
) ON CONFLICT (kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan, kd_blok, no_urut, kd_jns_op, thn_pajak_sppt) DO NOTHING;
