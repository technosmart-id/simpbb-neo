CREATE OR REPLACE PROCEDURE public.penilaian_jpb12(IN vlc_kd_propinsi text, IN vlc_kd_dati2 text, IN vlc_kd_kecamatan text, IN vlc_kd_kelurahan text, IN vlc_kd_blok text, IN vlc_no_urut text, IN vlc_kd_jns_op text, IN vln_no_bng bigint, IN vlc_tahun text, INOUT vln_nilai_jpb12 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


	vlc_type_jpb12                 dat_jpb12.type_jpb12%type;
	vln_nilai_komponen_utama 	   decimal(17,2)				 			  := 0;
	vln_luas_bng 				   dat_op_bangunan.luas_bng%type 		  := 0;
	vln_jml_lantai_bng 			   dat_op_bangunan.jml_lantai_bng%type 	  := 0;
	vlc_tahun_dibangun 			   dat_op_bangunan.thn_dibangun_bng%type;
	vlc_tahun_renovasi 			   dat_op_bangunan.thn_renovasi_bng%type;
	vlc_kondisi_bng 			   dat_op_bangunan.kondisi_bng%type;
	vlc_atap 					   dat_op_bangunan.jns_atap_bng%type;
	vlc_lantai 					   dat_op_bangunan.kd_lantai%type;
	vlc_langit_langit 			   dat_op_bangunan.kd_langit_langit%type;
	vln_nilai_atap 				   decimal(17,2)				 			  := 0;
	vln_nilai_lantai 			   decimal(17,2)				 			  := 0;
	vln_nilai_langit_langit 	   decimal(17,2)				 			  := 0;
	vlc_dinding 				   dat_op_bangunan.kd_dinding%type;
	vlc_cari_dinding 			   dbkb_material.kd_kegiatan%type;
	vln_nilai_dinding_temp 		   decimal(17,2)				 			  := 0;
	vln_nilai_dinding_plester 	   decimal(17,2)				 			  := 0;
	vln_nilai_dinding_cat 		   decimal(17,2)				 			  := 0;
	vln_nilai_dinding 			   decimal(17,2)				 			  := 0;
	vln_nilai_material 			   decimal(17,2)				 			  := 0;
	vln_nilai_fasilitas 		   decimal(17,2)				 			  := 0;
	vln_nilai_total_per_m2 		   decimal(17,2)				 			  := 0;
	vln_nilai_total_kali_luas 	   decimal(17,2)				 			  := 0;
	vln_nilai_fasilitas_susut 	   decimal(17,2)				 			  := 0;
	vln_nilai_sebelum_susut 	   decimal(17,2)				 			  := 0;
	vln_persentase_penyusutan 	   decimal(7,2)				 			  := 0;
	vln_nilai_setelah_susut 	   decimal(17,2)				 			  := 0;
	vln_nilai_fasilitas_tdk_susut  decimal(17,2)				 			  := 0;

/*---------------------------------
 DIBUAT OLEH : MADE
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 09-10-2000
*/
---------------------------------
BEGIN
    -------------------------------------------------------------------------------
  	--- Cari type bangunan
  	-------------------------------------------------------------------------------
  	BEGIN
	  	 SELECT type_jpb12
	  	 INTO STRICT   vlc_type_jpb12
	  	 FROM   dat_jpb12
	  	 WHERE  kd_propinsi   = vlc_kd_propinsi
	       AND  kd_dati2 	  = vlc_kd_dati2
	  	   AND  kd_kecamatan  = vlc_kd_kecamatan
	  	   AND  kd_kelurahan  = vlc_kd_kelurahan
	  	   AND  kd_blok 	  = vlc_kd_blok
	  	   AND  no_urut 	  = vlc_no_urut
	  	   AND  kd_jns_op 	  = vlc_kd_jns_op
	  	   AND  no_bng 	      = vln_no_bng;
    EXCEPTION
  		 WHEN   OTHERS THEN
		 		vlc_type_jpb12 := null;
    END;

  	-------------------------------------------------------------------------------
  	--- Cari biaya komponen utama /m2
  	-------------------------------------------------------------------------------
  	BEGIN
	  	 SELECT coalesce(nilai_dbkb_jpb12, 0)
	  	 INTO STRICT 	vln_nilai_komponen_utama
	  	 FROM   dbkb_jpb12
	  	 WHERE  kd_propinsi     = vlc_kd_propinsi
	       AND  kd_dati2 		= vlc_kd_dati2
	  	   AND  thn_dbkb_jpb12  = vlc_tahun
	  	   AND  type_dbkb_jpb12 = vlc_type_jpb12;

    EXCEPTION
		 WHEN  OTHERS THEN vln_nilai_komponen_utama := 0;
    END;
  	--dbms_output.put_line('vln_nilai_komponen_utama = '||to_char(vln_nilai_komponen_utama));
  	---------------------------------------------------------------------------------
  	--- Mengambil luas bangunan, tahun, dsb.
  	---------------------------------------------------------------------------------
  	BEGIN
   	  	 SELECT coalesce(luas_bng, 0),
	  		 	thn_dibangun_bng,
			 	thn_renovasi_bng,
			 	kondisi_bng,
			 	jml_lantai_bng
	     INTO STRICT 	vln_luas_bng,
	  		 	vlc_tahun_dibangun,
			 	vlc_tahun_renovasi,
			 	vlc_kondisi_bng,
			 	vln_jml_lantai_bng
	     FROM 	dat_op_bangunan
	  	 WHERE  kd_propinsi  = vlc_kd_propinsi
	       AND  kd_dati2 	 = vlc_kd_dati2
	  	   AND  kd_kecamatan = vlc_kd_kecamatan
	  	   AND  kd_kelurahan = vlc_kd_kelurahan
	  	   AND  kd_blok 	 = vlc_kd_blok
	  	   AND  no_urut 	 = vlc_no_urut
	  	   AND  kd_jns_op 	 = vlc_kd_jns_op
	  	   AND  no_bng 	  	 = vln_no_bng
	  	   AND  kd_jpb 	  	 = '12';
    EXCEPTION
  		 WHEN   OTHERS THEN
	     		vln_luas_bng       := 0;
	  		 	vlc_tahun_dibangun := null;
			 	vlc_tahun_renovasi := null;
			 	vlc_kondisi_bng    := null;
			 	vln_jml_lantai_bng := 0;
    END;

    ---------------------------------------------------------------------------------
    --- Menentukan Fasilitas / m2
    ---------------------------------------------------------------------------------
    vln_nilai_fasilitas := 0;

	vln_nilai_fasilitas := FASILITAS_SUSUT_X_LUAS(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, '12', vlc_type_jpb12, vlc_tahun, vln_nilai_fasilitas);
  	--dbms_output.put_line('vln_nilai_fasilitas = '||to_char(vln_nilai_fasilitas));
  	---------------------------------------------------------------------------------
  	--- Nilai Total / m2
  	---------------------------------------------------------------------------------
  	vln_nilai_total_per_m2 := vln_nilai_komponen_utama + vln_nilai_fasilitas;
  	--dbms_output.put_line('vln_nilai_total_per_m2 = '||to_char(vln_nilai_total_per_m2));
  	---------------------------------------------------------------------------------
  	--- Menghitung Nilai Total / m2 dikali luas
  	---------------------------------------------------------------------------------
  	vln_nilai_total_kali_luas := vln_nilai_total_per_m2 * vln_luas_bng;
  	--dbms_output.put_line('vln_nilai_total_kali_luas = '||to_char(vln_nilai_total_kali_luas));
  	---------------------------------------------------------------------------------
  	--- Menghitung Nilai Fasilitas yang disusutkan
  	---------------------------------------------------------------------------------
  	vln_nilai_fasilitas_susut := 0;

  	vln_nilai_fasilitas_susut := FASILITAS_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vln_jml_lantai_bng, vlc_tahun, vln_nilai_fasilitas_susut);
  	--dbms_output.put_line('vln_nilai_fasilitas_susut = '||to_char(vln_nilai_fasilitas_susut));
	---------------------------------------------------------------------------------
	--- Menghitung Nilai sebelum disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_sebelum_susut := vln_nilai_total_kali_luas + vln_nilai_fasilitas_susut;
  	--dbms_output.put_line('vln_nilai_sebelum_susut = '||to_char(vln_nilai_sebelum_susut));
	---------------------------------------------------------------------------------
	--- Menhitung Penyusutan Bangunan
	---------------------------------------------------------------------------------
	vln_persentase_penyusutan := SUSUT(vlc_tahun,
							  	       vlc_tahun_dibangun,
 		 							   vlc_tahun_renovasi,
									   vlc_kondisi_bng,
									   vln_nilai_sebelum_susut,
									   vln_luas_bng,
									   0);
  	--dbms_output.put_line('vln_persentase_penyusutan = '||to_char(vln_persentase_penyusutan));
	---------------------------------------------------------------------------------
	--- Menghitung Nilai Setelah disusutkan
	---------------------------------------------------------------------------------
    IF (vln_persentase_penyusutan IS NOT NULL AND vln_persentase_penyusutan::text <> '') OR (vln_persentase_penyusutan = 0)  THEN
	   vln_persentase_penyusutan  := round((vln_persentase_penyusutan / 100)::numeric,2);
	   vln_nilai_setelah_susut    := vln_nilai_sebelum_susut -
		  				  	        (vln_nilai_sebelum_susut * vln_persentase_penyusutan);
    ELSE
	   vln_nilai_setelah_susut    := vln_nilai_sebelum_susut;
	END IF;
  	--dbms_output.put_line('vln_nilai_setelah_susut = '||to_char(vln_nilai_setelah_susut));
	---------------------------------------------------------------------------------
	--- Menghitung Fasilitas Lain yang tidak disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_fasilitas_tdk_susut := 0;

	vln_nilai_fasilitas_tdk_susut := FASILITAS_TDK_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_nilai_fasilitas_tdk_susut);
  	--dbms_output.put_line('vln_nilai_fasilitas_tdk_susut = '||to_char(vln_nilai_fasilitas_tdk_susut));
	---------------------------------------------------------------------------------
	--- Total nilai JPB 12
	---------------------------------------------------------------------------------
	vln_nilai_jpb12 := vln_nilai_setelah_susut + vln_nilai_fasilitas_tdk_susut;

END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb13(IN vlc_kd_propinsi character, IN vlc_kd_dati2 character, IN vlc_kd_kecamatan character, IN vlc_kd_kelurahan character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vln_no_bng smallint, IN vlc_tahun character, INOUT vln_nilai_jpb13 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


  ----------------------------------------------------------------------
  -- variable perhitungan nilai nilai jpb 13 --
  ----------------------------------------------------------------------
  vln_penyusutan        decimal(17,2)				 			  := 0; -- dari procedure fas_tdk_susut
  vlc_thn_dibangun_bng  dat_op_bangunan.thn_dibangun_bng%type;
  vlc_thn_renovasi_bng  dat_op_bangunan.thn_renovasi_bng%type;
  vln_luas_bng          dat_op_bangunan.luas_bng%type;
  vln_jml_lantai_bng    dat_op_bangunan.jml_lantai_bng%type;
  vlc_kondisi_bng       dat_op_bangunan.kondisi_bng%type;
  vln_nilai_dbkb_jpb13  decimal(17,2)				 			  := 0;
  vlc_kls_jpb13         dat_jpb13.kls_jpb13%type;
  vln_jml_jpb13         decimal(17,2)				 			  := 0;
  vln_luas_jpb13        dat_jpb13.luas_jpb13_dgn_ac_sent%type;
  vln_luas_jpb13_lain   dat_jpb13.luas_jpb13_lain_dgn_ac_sent%type;
  vln_jml_satuan        dat_fasilitas_bangunan.jml_satuan%type    := 0;
  vlc_kd_fasilitas      fasilitas.kd_fasilitas%type;
  vlc_status_fasilitas  fasilitas.status_fasilitas%type;
  vlc_ketergantungan    fasilitas.ketergantungan%type;
  vln_nilai_fasilitas   decimal(17,2)				 			  := 0;
  vln_nilai_satuan      decimal(17,2)				 			  := 0;

  ----------------------------------------------------------------------
  -- cursor untuk cari nilai fasilitas --
  ----------------------------------------------------------------------
  cur_fasilitas CURSOR FOR
	     SELECT status_fasilitas,
			 	kd_fasilitas,
				ketergantungan
	  	 FROM   fasilitas
	  	 WHERE  status_fasilitas IN ('0','1','2','3')
	     ORDER  BY status_fasilitas, kd_fasilitas, ketergantungan;

/*---------------------------------
 DIBUAT OLEH : TEGUH
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 09-10-2000
*/
---------------------------------
BEGIN
  ----------------------------------------------------------------------
  --- cari data bangunan
  ----------------------------------------------------------------------
  BEGIN
       SELECT a.thn_dibangun_bng,
	   		  a.thn_renovasi_bng,
			  coalesce(a.luas_bng,0),
			  coalesce(a.jml_lantai_bng,0),
	   		  a.kondisi_bng,
			  b.kls_jpb13,
			  coalesce(b.jml_jpb13,0),
			  coalesce(b.luas_jpb13_dgn_ac_sent,0),
			  coalesce(b.luas_jpb13_lain_dgn_ac_sent,0)
       INTO STRICT   vlc_thn_dibangun_bng,
	   		  vlc_thn_renovasi_bng,
			  vln_luas_bng,
			  vln_jml_lantai_bng,
              vlc_kondisi_bng,
			  vlc_kls_jpb13,
			  vln_jml_jpb13,
			  vln_luas_jpb13,
			  vln_luas_jpb13_lain
       FROM dat_op_bangunan a
LEFT OUTER JOIN dat_jpb13 b ON (a.kd_propinsi = b.kd_propinsi AND a.kd_dati2 = b.kd_dati2 AND a.kd_kecamatan = b.kd_kecamatan AND a.kd_kelurahan = b.kd_kelurahan AND a.kd_blok = b.kd_blok AND a.no_urut = b.no_urut AND a.kd_jns_op = b.kd_jns_op AND a.no_bng = b.no_bng)
WHERE a.kd_propinsi      = vlc_kd_propinsi AND a.kd_dati2         = vlc_kd_dati2 AND a.kd_kecamatan     = vlc_kd_kecamatan AND a.kd_kelurahan     = vlc_kd_kelurahan AND a.kd_blok          = vlc_kd_blok AND a.no_urut          = vlc_no_urut AND a.kd_jns_op        = vlc_kd_jns_op AND a.no_bng           = vln_no_bng AND a.kd_jpb           = '13';
  EXCEPTION
       WHEN   OTHERS THEN
       		  vlc_thn_dibangun_bng := null;
	   		  vlc_thn_renovasi_bng := null;
			  vln_luas_bng		   := 0;
			  vln_jml_lantai_bng   := 0;
              vlc_kondisi_bng	   := null;
			  vlc_kls_jpb13		   := null;
			  vln_jml_jpb13		   := 0;
			  vln_luas_jpb13	   := 0;
			  vln_luas_jpb13_lain  := 0;
  END;

  ----------------------------------------------------------------------
  -- seek nilai komponen utama dbkb jpb 13 dari tabel DBKB_JPB13 --
  ----------------------------------------------------------------------
  BEGIN
	   SELECT nilai_dbkb_jpb13 INTO STRICT vln_nilai_dbkb_jpb13
	   FROM   dbkb_jpb13
	   WHERE  kd_propinsi       = vlc_kd_propinsi     AND
			  kd_dati2          = vlc_kd_dati2        AND
		 	  thn_dbkb_jpb13    = vlc_tahun           AND
		 	  kls_dbkb_jpb13    = vlc_kls_jpb13       AND
		 	  lantai_min_jpb13 <= vln_jml_lantai_bng  AND
		 	  lantai_max_jpb13 >= vln_jml_lantai_bng;
  EXCEPTION
       WHEN   OTHERS THEN
	   		  vln_nilai_dbkb_jpb13 := 0;
  END;
  ---dbms_output.put_line('vln_nilai_dbkb_jpb13 = '||to_char(vln_nilai_dbkb_jpb13));
  ----------------------------------------------------------------------
  --- nilai komponen utama X luas bangunan
  ----------------------------------------------------------------------
  vln_nilai_dbkb_jpb13 := vln_nilai_dbkb_jpb13 * vln_luas_bng;
  RAISE NOTICE 'nilai material * luas bng = %', vln_nilai_dbkb_jpb13::text;

  ----------------------------------------------------------------------
  --- cari nilai fasilitas yang dipengaruhi luas, jumlah unit apartemen
  ----------------------------------------------------------------------
  vln_nilai_fasilitas := 0;
  OPEN  cur_fasilitas;
  LOOP
      FETCH cur_fasilitas INTO vlc_status_fasilitas, vlc_kd_fasilitas, vlc_ketergantungan;
	  EXIT WHEN NOT FOUND;/* apply on cur_fasilitas */
			BEGIN
			  	SELECT coalesce(jml_satuan, 0) INTO STRICT vln_jml_satuan
			  	FROM   dat_fasilitas_bangunan
			  	WHERE  kd_propinsi  = vlc_kd_propinsi  AND
				       kd_dati2     = vlc_kd_dati2	   AND
				       kd_kecamatan = vlc_kd_kecamatan AND
				       kd_kelurahan = vlc_kd_kelurahan AND
				       kd_blok      = vlc_kd_blok      AND
				       no_urut      = vlc_no_urut  	   AND
				       kd_jns_op    = vlc_kd_jns_op    AND
				       no_bng       = vln_no_bng       AND
				       kd_fasilitas = vlc_kd_fasilitas;
			EXCEPTION
			    WHEN  no_data_found THEN vln_jml_satuan := 0;
			END;
			IF vlc_ketergantungan = '0' THEN
			   BEGIN
			    	 SELECT coalesce(nilai_non_dep, 0) INTO STRICT vln_nilai_satuan
			     	 FROM   fas_non_dep
			    	 WHERE  kd_propinsi  = vlc_kd_propinsi  AND
				   	 		kd_dati2     = vlc_kd_dati2     AND
				   			thn_non_dep  = vlc_tahun        AND
				   			kd_fasilitas = vlc_kd_fasilitas;
		       EXCEPTION
		         WHEN   no_data_found THEN vln_nilai_satuan := 0;
		       END;
			 ELSIF vlc_ketergantungan = '1' THEN
			       BEGIN
			       	    SELECT coalesce(nilai_dep_min_max, 0) INTO STRICT vln_nilai_satuan
			       	    FROM   fas_dep_min_max
			            WHERE  kd_propinsi     = vlc_kd_propinsi  AND
				           	   kd_dati2        = vlc_kd_dati2     AND
				           	   thn_dep_min_max = vlc_tahun        AND
				           	   kd_fasilitas    = vlc_kd_fasilitas AND
				           	   kls_dep_min    <= vln_jml_satuan   AND
				           	   kls_dep_max    >= vln_jml_satuan;
			       EXCEPTION
			    	    WHEN no_data_found THEN vln_nilai_satuan := 0;
			       END;
			 ELSIF vlc_ketergantungan = '2' THEN
			       BEGIN
			    	    SELECT coalesce(nilai_fasilitas_kls_bintang, 0) INTO STRICT vln_nilai_satuan
			    	    FROM   fas_dep_jpb_kls_bintang
			    	    WHERE  kd_propinsi     	   			= vlc_kd_propinsi   AND
				           	   kd_dati2        	   			= vlc_kd_dati2      AND
				   	   		   thn_dep_jpb_kls_bintang 		= vlc_tahun         AND
				   	   		   kd_fasilitas    	   			= vlc_kd_fasilitas  AND
				   	   		   kd_jpb		   				= '13'              AND
				   	   		   kls_bintang    	   			= vlc_kls_jpb13;
			       EXCEPTION
			    	    WHEN   no_data_found THEN vln_nilai_satuan := 0;
			       END;
			 ELSE vln_nilai_satuan := 0;
			 END IF;
		    RAISE NOTICE 'kode fasilitas + nilai satuan = % %', vlc_kd_fasilitas, vln_nilai_satuan::text;


			 IF vlc_status_fasilitas = '0'  THEN
			    vln_nilai_fasilitas := vln_nilai_fasilitas + (vln_nilai_satuan * vln_jml_satuan * vln_luas_bng);
			 ELSIF vlc_status_fasilitas = '1'  THEN
			       vln_nilai_fasilitas := vln_nilai_fasilitas + (vln_nilai_satuan * vln_jml_jpb13);
			 ELSIF vlc_status_fasilitas = '2'  THEN
			       vln_nilai_fasilitas := vln_nilai_fasilitas + (vln_nilai_satuan * vln_luas_jpb13);
			 ELSIF vlc_status_fasilitas = '3'  THEN
			       vln_nilai_fasilitas := vln_nilai_fasilitas + (vln_nilai_satuan * vln_luas_jpb13_lain);
			 ELSE vln_nilai_fasilitas := vln_nilai_fasilitas;
	     END IF;
  END LOOP;
  CLOSE cur_fasilitas;
  RAISE NOTICE 'nilai fasilitas dip luas + selain fas lain = %', vln_nilai_fasilitas::text;

  ----------------------------------------------------------------------
  --- nilai komponen utama + nilai fasilitas
  ----------------------------------------------------------------------
  vln_nilai_jpb13     := vln_nilai_dbkb_jpb13 + vln_nilai_fasilitas;
  RAISE NOTICE 'komp utama + fasili = %', vln_nilai_jpb13::text;

  ----------------------------------------------------------------------
  --- cari nilai fasilitas yang disusutkan
  ----------------------------------------------------------------------
  vln_nilai_fasilitas := FASILITAS_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vln_jml_lantai_bng, vlc_tahun, vln_nilai_fasilitas);
  RAISE NOTICE 'nilai fasilitas susut = %', vln_nilai_fasilitas::text;

  vln_nilai_jpb13     := vln_nilai_jpb13 + vln_nilai_fasilitas;
  RAISE NOTICE 'nilai + fas susut = %', vln_nilai_jpb13::text;

  ----------------------------------------------------------------------
  --- cari prosentase penyusutan
  ----------------------------------------------------------------------
  vln_penyusutan     := SUSUT(vlc_tahun,
  					 	      vlc_thn_dibangun_bng,
							  vlc_thn_renovasi_bng,
                              vlc_kondisi_bng,
							  vln_nilai_jpb13,
							  vln_luas_bng,
							  0);

  ----------------------------------------------------------------------
  --- cari nilai setelah disusutkan
  ----------------------------------------------------------------------
  --dbms_output.put_line('vln_penyusutan = '||to_char(vln_penyusutan));
  vln_penyusutan     := ROUND((vln_penyusutan * vln_nilai_jpb13) / 100);
  vln_nilai_jpb13     := vln_nilai_jpb13 - vln_penyusutan;
  --dbms_output.put_line('vln_nilai_jpb13 = '||to_char(vln_nilai_jpb13));
  ----------------------------------------------------------------------
  --- cari nilai fasilitas yang tidak disusutkan
  ----------------------------------------------------------------------
  vln_nilai_fasilitas := FASILITAS_TDK_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_nilai_fasilitas);
  --dbms_output.put_line('vln_nilai_fasilitas = '||to_char(vln_nilai_fasilitas));
  ----------------------------------------------------------------------
  --- cari nilai jpb 13
  ----------------------------------------------------------------------
  vln_nilai_jpb13     := vln_nilai_jpb13 + vln_nilai_fasilitas;

END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb14(IN vlc_kd_propinsi character, IN vlc_kd_dati2 character, IN vlc_kd_kecamatan character, IN vlc_kd_kelurahan character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vln_no_bng smallint, IN vlc_tahun character, INOUT vln_nilai_jpb14 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


  ------------------------------------------------------------------------------
  -- variable perhitungan nilai nilai jpb 14 --
  ------------------------------------------------------------------------------
  vln_penyusutan          decimal(17,2)				 			  := 0; -- dari procedure fas_tdk_susut
  vlc_thn_dibangun_bng    dat_op_bangunan.thn_dibangun_bng%type;
  vlc_thn_renovasi_bng    dat_op_bangunan.thn_renovasi_bng%type;
  vln_luas_bng            dat_op_bangunan.luas_bng%type;
  vln_jml_lantai_bng      dat_op_bangunan.jml_lantai_bng%type;
  vlc_kondisi_bng         dat_op_bangunan.kondisi_bng%type;
  vln_nilai_dbkb_jpb14    decimal(17,2)				 			  := 0;
  vln_nilai_fasilitas     decimal(17,2)				 			  := 0;
  vln_fasilitas_susut     decimal(17,2)				 			  := 0;
  vln_fasilitas_tdk_susut decimal(17,2)				 			  := 0;

/*---------------------------------
 DIBUAT OLEH : TEGUH
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 09-10-2000
*/
---------------------------------
BEGIN
  ------------------------------------------------------------------------------
  --- cari data bangunan
  ------------------------------------------------------------------------------
  BEGIN
       SELECT thn_dibangun_bng,
	   		  thn_renovasi_bng,
			  coalesce(luas_bng,0),
	   		  coalesce(jml_lantai_bng,0),
			  coalesce(kondisi_bng,'4')
       INTO STRICT   vlc_thn_dibangun_bng,
	   		  vlc_thn_renovasi_bng,
			  vln_luas_bng,
			  vln_jml_lantai_bng,
              vlc_kondisi_bng
       FROM   dat_op_bangunan
       WHERE  kd_propinsi      = vlc_kd_propinsi  AND
	   		  kd_dati2         = vlc_kd_dati2     AND
	   		  kd_kecamatan     = vlc_kd_kecamatan AND
	   		  kd_kelurahan     = vlc_kd_kelurahan AND
	   		  kd_blok          = vlc_kd_blok      AND
	   		  no_urut          = vlc_no_urut      AND
	   		  kd_jns_op        = vlc_kd_jns_op    AND
	   		  no_bng           = vln_no_bng       AND
	   		  kd_jpb           = '14';
  EXCEPTION
       WHEN   OTHERS THEN
       		  vlc_thn_dibangun_bng := null;
	   		  vlc_thn_renovasi_bng := null;
			  vln_luas_bng		   := 0;
			  vln_jml_lantai_bng   := 0;
              vlc_kondisi_bng	   := null;
  END;

  ------------------------------------------------------------------------------
  --- cari nilai komponen utama / m2
  ------------------------------------------------------------------------------
  BEGIN
       SELECT nilai_dbkb_jpb14
	   INTO STRICT   vln_nilai_dbkb_jpb14
       FROM   dbkb_jpb14
       WHERE  kd_propinsi       = vlc_kd_propinsi    AND
	   		  kd_dati2          = vlc_kd_dati2       AND
 	   		  thn_dbkb_jpb14    = vlc_tahun;
  EXCEPTION
       WHEN   OTHERS THEN vln_nilai_dbkb_jpb14 := 0;
  END;
  --dbms_output.put_line('vln_nilai_dbkb_jpb14 = '||to_char(vln_nilai_dbkb_jpb14));
  ------------------------------------------------------------------------------
  --- cari nilai komponen utama / m2 X luas bangunan
  ------------------------------------------------------------------------------
  vln_nilai_jpb14 	   := vln_nilai_dbkb_jpb14 * vln_luas_bng;
  --dbms_output.put_line('vln_nilai_jpb14 = '||to_char(vln_nilai_jpb14));
  ------------------------------------------------------------------------------
  --- cari nilai fasilitas yang disusutkan
  ------------------------------------------------------------------------------
  vln_nilai_fasilitas  := 0;
  vln_nilai_fasilitas := FASILITAS_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vln_jml_lantai_bng, vlc_tahun, vln_nilai_fasilitas);
  --dbms_output.put_line('vln_nilai_fasilitas = '||to_char(vln_nilai_fasilitas));
  ------------------------------------------------------------------------------
  --- cari nilai sebelum disusutkan
  ------------------------------------------------------------------------------
  vln_nilai_jpb14      := vln_nilai_jpb14 + coalesce(vln_nilai_fasilitas,0);
  --dbms_output.put_line('vln_nilai_jpb14 = '||to_char(vln_nilai_jpb14));
  ------------------------------------------------------------------------------
  --- cari prosentase penyusutan
  ------------------------------------------------------------------------------
  vln_penyusutan       := SUSUT(vlc_tahun,
  					   	  		vlc_thn_dibangun_bng,
								vlc_thn_renovasi_bng,
                                vlc_kondisi_bng,
								vln_nilai_jpb14,
								vln_luas_bng,
								0);
  --dbms_output.put_line('vln_penyusutan = '||to_char(vln_penyusutan));
  vln_penyusutan       := ROUND((vln_penyusutan * vln_nilai_jpb14) / 100);

  ------------------------------------------------------------------------------
  --- cari nilai setelah disusutkan
  ------------------------------------------------------------------------------
  vln_nilai_jpb14      := vln_nilai_jpb14 - vln_penyusutan;
  --dbms_output.put_line('vln_nilai_jpb14 = '||to_char(vln_nilai_jpb14));
  ------------------------------------------------------------------------------
  --- cari nilai fasilitas yang tidak disusutkan
  ------------------------------------------------------------------------------
  vln_nilai_fasilitas  := 0;
  vln_nilai_fasilitas := FASILITAS_TDK_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_nilai_fasilitas);
  --dbms_output.put_line('vln_nilai_fasilitas = '||to_char(vln_nilai_fasilitas));
  ------------------------------------------------------------------------------
  --- tentukan nilai fasilitas yang tidak disusutkan
  ------------------------------------------------------------------------------
  vln_nilai_jpb14      := vln_nilai_jpb14 + vln_nilai_fasilitas;

END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb15(IN vlc_kd_prop character, IN vlc_kd_dati2 character, IN vlc_kd_kec character, IN vlc_kd_kel character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vln_no_bng smallint, IN vlc_tahun character, INOUT vln_nilai_jpb15 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


   vln_luas_bng   	      dat_op_bangunan.luas_bng%type;
   vlc_kondisi_bng 	   	  dat_op_bangunan.kondisi_bng%type;
   vln_jml_lantai_bng  	  dat_op_bangunan.jml_lantai_bng%type;
   vlc_thn_dibangun    	  dat_op_bangunan.thn_dibangun_bng%type;
   vlc_thn_renovasi    	  dat_op_bangunan.thn_renovasi_bng%type;
   vln_besar_susut     	  decimal(17,2)				 			  := 0;
   vln_persen_susut    	  decimal(17,2)				 			  := 0;

   vlc_letak_tangki_jpb15 dat_jpb15.letak_tangki_jpb15%type;
   vln_kapasitas_tangki   decimal(17,2)				 			  := 0;
   vln_nilai_dbkb 		  decimal(17,2)				 			  := 0;

   vln_tahun          	  smallint;
   vln_tahun_dibangun 	  smallint;
   vln_tahun_renovasi 	  smallint;
   vln_umur_efektif		  bigint;

/*---------------------------------
 DIBUAT OLEH : SUNARYO
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 09-10-2000
*/
---------------------------------
BEGIN
   -------------------------------------------------------------------------
   --- Cari data bangunan
   -------------------------------------------------------------------------
   SELECT luas_bng,
   		  thn_dibangun_bng,
		  thn_renovasi_bng,
   		  kondisi_bng
   INTO STRICT   vln_luas_bng,
		  vlc_thn_dibangun,
		  vlc_thn_renovasi,
   		  vlc_kondisi_bng
   FROM   dat_op_bangunan
   WHERE  kd_propinsi   = vlc_kd_prop   AND
	 	  kd_dati2 		= vlc_kd_dati2  AND
	 	  kd_kecamatan  = vlc_kd_kec    AND
	 	  kd_kelurahan  = vlc_kd_kel    AND
	 	  kd_blok 		= vlc_kd_blok   AND
	 	  no_urut 		= vlc_no_urut   AND
	 	  kd_jns_op  	= vlc_kd_jns_op AND
	 	  no_bng 		= vln_no_bng;

   IF FOUND THEN
   	  -------------------------------------------------------------------------
   	  --- Cari data tangki
   	  -------------------------------------------------------------------------
      BEGIN
	  	   SELECT letak_tangki_jpb15,
	  		 	  kapasitas_tangki_jpb15
 	  	   INTO STRICT   vlc_letak_tangki_jpb15,
	  		 	  vln_kapasitas_tangki
	       FROM   dat_jpb15
 	  	   WHERE (kd_propinsi   = vlc_kd_prop   AND
      		 	  kd_dati2      = vlc_kd_dati2  AND
    		 	  kd_kecamatan  = vlc_kd_kec    AND
    		 	  kd_kelurahan  = vlc_kd_kel    AND
    		 	  kd_blok       = vlc_kd_blok   AND
    		 	  no_urut       = vlc_no_urut   AND
    		 	  kd_jns_op     = vlc_kd_jns_op AND
    		 	  no_bng        = vln_no_bng);
	  EXCEPTION
	     WHEN OTHERS THEN
		     vlc_letak_tangki_jpb15 := null;
			 vln_kapasitas_tangki   := 0;
   	  END;

   	  -------------------------------------------------------------------------
   	  --- Cari nilai tangki
   	  -------------------------------------------------------------------------
      vln_nilai_dbkb := 0;
	  BEGIN
	  	   SELECT nilai_dbkb_jpb15
      	   INTO STRICT   vln_nilai_dbkb
      	   FROM   dbkb_jpb15
      	   WHERE  kd_propinsi               = vlc_kd_prop            AND
             	  kd_dati2                  = vlc_kd_dati2 			 AND
             	  thn_dbkb_jpb15            = vlc_tahun 			 AND
             	  jns_tangki_dbkb_jpb15     = vlc_letak_tangki_jpb15 AND
             	  kapasitas_min_dbkb_jpb15 <= vln_kapasitas_tangki 	 AND
             	  kapasitas_max_dbkb_jpb15 >= vln_kapasitas_tangki;
	  EXCEPTION
	       WHEN OTHERS THEN
		   vln_nilai_dbkb := 0;
	  END;
  	  --dbms_output.put_line('vln_nilai_dbkb = '||to_char(vln_nilai_dbkb));
   	  -------------------------------------------------------------------------
   	  --- Cari prosentase penyusutan
   	  -------------------------------------------------------------------------
	  vln_tahun          := (coalesce(vlc_tahun,0))::numeric;
	  vln_tahun_dibangun := (coalesce(vlc_thn_dibangun,0))::numeric;
	  vln_tahun_renovasi := (coalesce(vlc_thn_renovasi,0))::numeric;

	  	--- mencari umur efektif
		IF vln_tahun_dibangun > 0 THEN
		   -- jika tahun dibangun ada
		   IF vln_tahun_renovasi > 0 THEN
			  -- jika tahun renovasi ada
			  IF (vln_tahun - vln_tahun_renovasi) > 10 THEN
				 -- (jika tahun pajak - tahun renovasi) > 10
				 vln_umur_efektif := ROUND(((vln_tahun - vln_tahun_dibangun) + (2*10)) / 3);
	             -- (jika tahun pajak - tahun renovasi) <= 10
			  ELSIF (vln_tahun - vln_tahun_renovasi) <= 10 THEN
				  vln_umur_efektif := ROUND(((vln_tahun - vln_tahun_dibangun) +
											(2*(vln_tahun - vln_tahun_renovasi))) / 3);
			  ELSE
				  vln_umur_efektif := 0;
			  END IF;
			ELSE
				-- tahun renovasi kosong
				IF (vln_tahun - vln_tahun_dibangun) > 10 THEN
					vln_umur_efektif := ROUND(((vln_tahun - vln_tahun_dibangun) + (2*10)) / 3);
				ELSIF (vln_tahun - vln_tahun_dibangun) <= 10 THEN
					vln_umur_efektif := vln_tahun - vln_tahun_dibangun;
				ELSE
					vln_umur_efektif := 0;
				END IF;
			END IF;
		ELSE
			vln_umur_efektif := 0;
		END IF;

		IF vln_umur_efektif > 40 THEN
		   vln_umur_efektif := 40;
		END IF;

      vln_besar_susut := coalesce(vln_umur_efektif,0) * 5;
  	  --dbms_output.put_line('vln_besar_susut = '||to_char(vln_besar_susut));
   	  -------------------------------------------------------------------------
   	  --- Cari nilai jpb 15
   	  -------------------------------------------------------------------------
	  IF (vln_besar_susut IS NOT NULL AND vln_besar_susut::text <> '') OR (vln_besar_susut = 0) THEN
	  	 IF vln_besar_susut > 50 THEN
		 	vln_besar_susut := 50;
		 END IF;
		 vln_persen_susut    := round((vln_besar_susut / 100)::numeric,2);
	     vln_nilai_jpb15 	 := (vln_nilai_dbkb -
		                        (vln_nilai_dbkb * vln_persen_susut));
	  ELSE
	     vln_nilai_jpb15 	 := vln_nilai_dbkb;
	  END IF;

   ELSE
	  vln_nilai_jpb15 := 0;
   END IF;

EXCEPTION
   WHEN OTHERS THEN
		vln_nilai_jpb15 := 0;
END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb16(IN vlc_kd_prop character, IN vlc_kd_dati2 character, IN vlc_kd_kec character, IN vlc_kd_kel character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vln_no_bng smallint, IN vlc_tahun character, INOUT vln_nilai_jpb16 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


   vlc_kls_jpb16        dat_jpb16.kls_jpb16%type;
   vln_nilai_dbkb_jpb16	decimal(17,2)				 			  := 0;
   vlc_kd_jpb   		dat_op_bangunan.kd_jpb%type;

   vln_luas_bng   		dat_op_bangunan.luas_bng%type;
   vlc_kondisi_bng 		dat_op_bangunan.kondisi_bng%type;
   vln_jml_lantai_bng   dat_op_bangunan.jml_lantai_bng%type;
   vln_komp_utama 		decimal(17,2)				 			  := 0;
   vln_nilai_fas1 		decimal(17,2)				 			  := 0;
   vln_nilai_fas2 		decimal(17,2)				 			  := 0;
   vln_nilai_fas3 		decimal(17,2)				 			  := 0;
   vln_nilai1     		decimal(17,2)				 			  := 0;
   vln_nilai_sbl_susut  decimal(17,2)				 			  := 0;
   vln_nilai_stl_susut  decimal(17,2)				 			  := 0;
   vlc_thn_dibangun     dat_op_bangunan.thn_dibangun_bng%type;
   vlc_thn_renovasi     dat_op_bangunan.thn_renovasi_bng%type;
   vln_besar_susut      decimal(17,2)				 			  := 0;
   vln_persen_susut     decimal(17,2)				 			  := 0;

/*---------------------------------
 DIBUAT OLEH : SUNARYO
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 09-10-2000
*/
---------------------------------
BEGIN
   SELECT kd_jpb,
   		  luas_bng,
	      thn_dibangun_bng,
          thn_renovasi_bng,
		  kondisi_bng,
		  jml_lantai_bng
   INTO STRICT   vlc_kd_jpb,
   		  vln_luas_bng,
		  vlc_thn_dibangun,
		  vlc_thn_renovasi,
   		  vlc_kondisi_bng,
		  vln_jml_lantai_bng
   FROM   dat_op_bangunan
   WHERE  kd_propinsi   = vlc_kd_prop    AND
	 	  kd_dati2 	    = vlc_kd_dati2   AND
	 	  kd_kecamatan  = vlc_kd_kec     AND
	 	  kd_kelurahan  = vlc_kd_kel     AND
	 	  kd_blok 	    = vlc_kd_blok    AND
	 	  no_urut 	    = vlc_no_urut    AND
	 	  kd_jns_op  	= vlc_kd_jns_op  AND
	 	  no_bng 		= vln_no_bng;

	 IF FOUND THEN
   	   BEGIN
      	  SELECT kls_jpb16
	  	  INTO STRICT   vlc_kls_jpb16
	  	  FROM   dat_jpb16
   	  	  WHERE  kd_propinsi   = vlc_kd_prop    AND
	 	  	 	 kd_dati2 	   = vlc_kd_dati2   AND
	 	  	 	 kd_kecamatan  = vlc_kd_kec     AND
	 	  	 	 kd_kelurahan  = vlc_kd_kel     AND
	 	  	 	 kd_blok 	   = vlc_kd_blok    AND
	 	  	 	 no_urut 	   = vlc_no_urut    AND
	 	  	 	 kd_jns_op     = vlc_kd_jns_op  AND
	 	  	 	 no_bng 	   = vln_no_bng;
   	   EXCEPTION
      	    WHEN   no_data_found THEN vlc_kls_jpb16 := null;
   	   END;

	   BEGIN
     	  SELECT nilai_dbkb_jpb16
     	  INTO STRICT   vln_nilai_dbkb_jpb16
     	  FROM   dbkb_jpb16
     	  WHERE  kd_propinsi      = vlc_kd_prop        AND
             	 kd_dati2         = vlc_kd_dati2 	   AND
            	 thn_dbkb_jpb16    = vlc_tahun 	  	   AND
            	 kls_dbkb_jpb16    = vlc_kls_jpb16       AND
            	 lantai_min_jpb16 <= vln_jml_lantai_bng AND
            	 lantai_max_jpb16 >= vln_jml_lantai_bng;
   	   EXCEPTION
          WHEN   no_data_found THEN
		         vln_nilai_dbkb_jpb16 := 0;
   	   END;

   	   vln_komp_utama := vln_nilai_dbkb_jpb16;
  	   --dbms_output.put_line('vln_komp_utama = '||to_char(vln_komp_utama));
	   vln_nilai_fas1 := FASILITAS_SUSUT_X_LUAS(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_kd_jpb, vlc_kls_jpb16, vlc_tahun, vln_nilai_fas1);
  	   --dbms_output.put_line('vln_nilai_fas1 = '||to_char(vln_nilai_fas1));
	   vln_nilai1 := (coalesce(vln_komp_utama,0) + coalesce(vln_nilai_fas1,0)) * coalesce(vln_luas_bng,0);
  	   --dbms_output.put_line('vln_nilai1 = '||to_char(vln_nilai1));
	   vln_nilai_fas2 := FASILITAS_SUSUT(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vln_jml_lantai_bng, vlc_tahun, vln_nilai_fas2);
  	   --dbms_output.put_line('vln_nilai_fas2 = '||to_char(vln_nilai_fas2));
	   vln_nilai_sbl_susut := coalesce(vln_nilai1,0) + coalesce(vln_nilai_fas2,0);
  	   --dbms_output.put_line('vln_nilai_sbl_susut = '||to_char(vln_nilai_sbl_susut));
	   vln_besar_susut := SUSUT(vlc_tahun,
	                            vlc_thn_dibangun,
								vlc_thn_renovasi,
             			  		vlc_kondisi_bng,
								vln_nilai_sbl_susut,
								vln_luas_bng,
								0);
  	   --dbms_output.put_line('vln_besar_susut = '||to_char(vln_besar_susut));
	   IF (vln_besar_susut IS NOT NULL AND vln_besar_susut::text <> '') OR (vln_besar_susut = 0) THEN
		  vln_persen_susut    := round((vln_besar_susut/100)::numeric, 2);
	      vln_nilai_stl_susut := (vln_nilai_sbl_susut -
		                         (vln_nilai_sbl_susut * vln_persen_susut));
	   ELSE
	      vln_nilai_stl_susut := vln_nilai_sbl_susut;
	   END IF;
  	   --dbms_output.put_line('vln_nilai_stl_susut = '||to_char(vln_nilai_stl_susut));
       vln_nilai_fas3 := FASILITAS_TDK_SUSUT(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_nilai_fas3);
  	   --dbms_output.put_line('vln_nilai_fas3 = '||to_char(vln_nilai_fas3));
	   vln_nilai_jpb16 := vln_nilai_stl_susut + coalesce(vln_nilai_fas3,0);
     ELSE
	   vln_nilai_jpb16 := 0;
	 END IF;
EXCEPTION
  WHEN no_data_found THEN vln_nilai_jpb16 := 0;--NULL;
END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb2(IN vlc_kd_prop character, IN vlc_kd_dati2 character, IN vlc_kd_kec character, IN vlc_kd_kel character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vln_no_bng smallint, IN vlc_tahun character, INOUT vln_nilai_jpb2 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


   vlc_kls_jpb2 	  	dat_jpb2.kls_jpb2%type;
   vln_nilai_dbkb_jpb2	decimal(17,2)				 			  := 0;
   vlc_kd_jpb   		dat_op_bangunan.kd_jpb%type;

   vln_luas_bng   		dat_op_bangunan.luas_bng%type;
   vlc_kondisi_bng 		dat_op_bangunan.kondisi_bng%type;
   vln_jml_lantai_bng 	dat_op_bangunan.jml_lantai_bng%type;
   vln_komp_utama 		decimal(17,2)				 			  := 0;
   vln_nilai_fas1 		decimal(17,2)				 			  := 0;
   vln_nilai_fas2 		decimal(17,2)				 			  := 0;
   vln_nilai_fas3 		decimal(17,2)				 			  := 0;
   vln_nilai1     		decimal(17,2)				 			  := 0;
   vln_nilai_sbl_susut  decimal(17,2)				 			  := 0;
   vln_nilai_stl_susut  decimal(17,2)				 			  := 0;
   vlc_thn_dibangun     dat_op_bangunan.thn_dibangun_bng%type;
   vlc_thn_renovasi     dat_op_bangunan.thn_renovasi_bng%type;
   vln_besar_susut      decimal(17,2)				 			  := 0;
   vln_persen_susut     decimal(17,2)				 			  := 0;

/*---------------------------------
 DIBUAT OLEH : SUNARYO
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 05-10-2000
*/
---------------------------------
BEGIN
   SELECT kd_jpb,
   		  luas_bng,
	      thn_dibangun_bng,
          thn_renovasi_bng,
		  kondisi_bng,
		  jml_lantai_bng
   INTO STRICT   vlc_kd_jpb,
   		  vln_luas_bng,
		  vlc_thn_dibangun,
		  vlc_thn_renovasi,
   		  vlc_kondisi_bng,
		  vln_jml_lantai_bng
   FROM   dat_op_bangunan
   WHERE  kd_propinsi   = vlc_kd_prop    AND
	 	  kd_dati2 	    = vlc_kd_dati2   AND
	 	  kd_kecamatan  = vlc_kd_kec     AND
	 	  kd_kelurahan  = vlc_kd_kel     AND
	 	  kd_blok 	    = vlc_kd_blok    AND
	 	  no_urut 	    = vlc_no_urut    AND
	 	  kd_jns_op  	= vlc_kd_jns_op  AND
	 	  no_bng 		= vln_no_bng;

	 IF FOUND THEN
	   RAISE NOTICE '=====================================================';
   	   BEGIN
      	  SELECT kls_jpb2
	  	  INTO STRICT   vlc_kls_jpb2
	  	  FROM   dat_jpb2
   	  	  WHERE  kd_propinsi   = vlc_kd_prop    AND
	 	  	 	 kd_dati2 	   = vlc_kd_dati2   AND
	 	  	 	 kd_kecamatan  = vlc_kd_kec     AND
	 	  	 	 kd_kelurahan  = vlc_kd_kel     AND
	 	  	 	 kd_blok 	   = vlc_kd_blok    AND
	 	  	 	 no_urut 	   = vlc_no_urut    AND
	 	  	 	 kd_jns_op     = vlc_kd_jns_op  AND
	 	  	 	 no_bng 	   = vln_no_bng;
   	   EXCEPTION
      	    WHEN   no_data_found THEN vlc_kls_jpb2 := null;
   	   END;
	   RAISE NOTICE 'vlc_kls_jpb2 = %', vlc_kls_jpb2;

	   BEGIN
     	  SELECT nilai_dbkb_jpb2
     	  INTO STRICT   vln_nilai_dbkb_jpb2
     	  FROM   dbkb_jpb2
     	  WHERE  kd_propinsi      = vlc_kd_prop        AND
             	 kd_dati2         = vlc_kd_dati2 	   AND
            	 thn_dbkb_jpb2    = vlc_tahun 	  	   AND
            	 kls_dbkb_jpb2    = vlc_kls_jpb2       AND
            	 lantai_min_jpb2 <= vln_jml_lantai_bng AND
            	 lantai_max_jpb2 >= vln_jml_lantai_bng;
   	   EXCEPTION
          WHEN   no_data_found THEN
		         vln_nilai_dbkb_jpb2 := 0;
   	   END;

   	   vln_komp_utama := vln_nilai_dbkb_jpb2;

	   RAISE NOTICE 'vln_komp_utama = %', vln_komp_utama::text;

	   vln_nilai_fas1 := FASILITAS_SUSUT_X_LUAS(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_kd_jpb, vlc_kls_jpb2, vlc_tahun, vln_nilai_fas1);

	   vln_nilai1 := (coalesce(vln_komp_utama,0) + coalesce(vln_nilai_fas1,0)) * coalesce(vln_luas_bng,0);
	   RAISE NOTICE 'vln_nilai_fas_x_luas = %', vln_nilai_fas1::text;
	   RAISE NOTICE 'vln_nilai1 = %', vln_nilai1::text;

	   vln_nilai_fas2 := FASILITAS_SUSUT(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vln_jml_lantai_bng, vlc_tahun, vln_nilai_fas2);

	   RAISE NOTICE 'vln_nilai_fas_susut = %', vln_nilai_fas2::text;
	   vln_nilai_sbl_susut := coalesce(vln_nilai1,0) + coalesce(vln_nilai_fas2,0);
	   RAISE NOTICE 'vln_nilai_sbl_susut = %', vln_nilai_sbl_susut::text;

	   IF (coalesce(vlc_thn_renovasi::text, '') = '') OR (vlc_thn_renovasi = ' ') THEN
	      vlc_thn_renovasi := '0';
	   END IF;

       vln_besar_susut := SUSUT(vlc_tahun,
	   				   	  	    vlc_thn_dibangun,
								vlc_thn_renovasi,
                      			vlc_kondisi_bng,
								vln_nilai_sbl_susut,
								vln_luas_bng,
								0);

	   RAISE NOTICE 'vln_besar_susut = %', vln_besar_susut::text;
	   IF (vln_besar_susut IS NOT NULL AND vln_besar_susut::text <> '') OR (vln_besar_susut = 0) THEN
		  vln_persen_susut    := round((vln_besar_susut / 100)::numeric,2);
	      vln_nilai_stl_susut := (vln_nilai_sbl_susut -
		  					  	 (vln_nilai_sbl_susut * vln_persen_susut));
	   ELSE
	      vln_nilai_stl_susut := vln_nilai_sbl_susut;
	   END IF;
	   RAISE NOTICE 'vln_nilai_stl_susut = %', vln_nilai_stl_susut::text;

	   vln_nilai_fas3 := FASILITAS_TDK_SUSUT(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_nilai_fas3);
	   RAISE NOTICE 'vln_nilai_fas_tdk_susut = %', vln_nilai_fas3::text;

	   vln_nilai_jpb2    := vln_nilai_stl_susut + coalesce(vln_nilai_fas3,0);

     ELSE
	   vln_nilai_jpb2 := 0;
	 END IF;
EXCEPTION
   WHEN no_data_found THEN vln_nilai_jpb2 := 0; --NULL;
END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb3(IN vlc_kd_propinsi text, IN vlc_kd_dati2 text, IN vlc_kd_kecamatan text, IN vlc_kd_kelurahan text, IN vlc_kd_blok text, IN vlc_no_urut text, IN vlc_kd_jns_op text, IN vln_no_bng bigint, IN vlc_tahun text, INOUT vln_njop_jpb3 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


	vln_tinggi_kolom               decimal(17,2) 									:= 0;
	vln_lebar_bentang 			   decimal(17,2) 									:= 0;
	vln_nilai_komponen_utama 	   decimal(17,2) 									:= 0;
	vlc_atap 					   dat_op_bangunan.jns_atap_bng%type;
	vlc_lantai 					   dat_op_bangunan.kd_lantai%type;
	vlc_langit_langit 			   dat_op_bangunan.kd_langit_langit%type;
	vlc_dinding 				   dat_op_bangunan.kd_dinding%type;
	vln_jml_lantai_bng		   	   decimal(17,2) 									:= 0;
	vln_nilai_atap 				   decimal(17,2) 									:= 0;
	vln_nilai_lantai 			   decimal(17,2) 									:= 0;
	vln_nilai_langit_langit 	   decimal(17,2) 									:= 0;
	vln_nilai_material 			   decimal(17,2) 									:= 0;
	vlc_type_konstruksi 		   dat_jpb3.type_konstruksi%type;
	vlc_cari_dinding 			   dbkb_material.kd_kegiatan%type;
	vln_nilai_dinding			   decimal(17,2) 									:= 0;
	vln_nilai_daya_dukung 		   decimal(17,2) 									:= 0;

	vln_nilai_fasilitas 		   decimal(17,2) 									:= 0;
	vln_nilai_total_per_m2 		   decimal(17,2) 									:= 0;
	vln_luas_bng 				   dat_op_bangunan.luas_bng%type 					:= 0;
	vln_nilai_total_kali_luas 	   decimal(17,2) 									:= 0;
	vln_keliling_dinding 		   dat_jpb3.keliling_dinding_jpb3%type 				:= 0;
	vln_total_nilai_dinding 	   decimal(17,2) 									:= 0;
	vln_luas_mezzanine 			   dat_jpb3.luas_mezzanine_jpb3%type 				:= 0;
	vln_nilai_mezzanine 		   decimal(17,2) 									:= 0;
	vln_nilai_total_mezzanine 	   decimal(17,2) 									:= 0;
	vln_nilai_fasilitas_susut 	   decimal(17,2) 									:= 0;
	vln_nilai_sebelum_susut 	   decimal(17,2) 									:= 0;
	vlc_tahun_dibangun 			   dat_op_bangunan.thn_dibangun_bng%type;
	vlc_tahun_renovasi 			   dat_op_bangunan.thn_renovasi_bng%type;
	vln_umur_efektif 			   smallint 							 			:= 0;
	vln_biaya_pengganti_baru 	   decimal(17,2) 									:= 0;
	vlc_kondisi_bng 			   dat_op_bangunan.kondisi_bng%type;
	vln_persentase_penyusutan 	   decimal(17,2) 									:= 0;
	vln_nilai_setelah_susut 	   decimal(17,2) 									:= 0;
	vln_nilai_fasilitas_tdk_susut  decimal(17,2) 									:= 0;

/*---------------------------------
 DIBUAT OLEH : MADE
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 06-10-2000
*/
---------------------------------
BEGIN
	-------------------------------------------------------------------------------
	--- Menentukan biaya komponen utama / m2
	-------------------------------------------------------------------------------
    BEGIN
	  SELECT coalesce(ting_kolom_jpb3, 0),
	         coalesce(lbr_bent_jpb3,0),
			 coalesce(keliling_dinding_jpb3,0),
	  		 coalesce(luas_mezzanine_jpb3,0),
			 type_konstruksi
	  INTO STRICT   vln_tinggi_kolom,
	         vln_lebar_bentang,
			 vln_keliling_dinding,
	  		 vln_luas_mezzanine,
			 vlc_type_konstruksi
	  FROM   dat_jpb3
	  WHERE  kd_propinsi  = vlc_kd_propinsi
	    AND  kd_dati2     = vlc_kd_dati2
	  	AND  kd_kecamatan = vlc_kd_kecamatan
	  	AND  kd_kelurahan = vlc_kd_kelurahan
	  	AND  kd_blok 	  = vlc_kd_blok
	  	AND  no_urut 	  = vlc_no_urut
	  	AND  kd_jns_op 	  = vlc_kd_jns_op
	  	AND  no_bng 	  = vln_no_bng;

    EXCEPTION
  	  WHEN 	 OTHERS THEN
	  		 vln_tinggi_kolom     := 0;
	         vln_lebar_bentang	  := 0;
			 vln_keliling_dinding := 0;
	  		 vln_luas_mezzanine	  := 0;
			 vlc_type_konstruksi  := null;
    END;

	   --dbms_output.put_line('=====================================================');
	   --dbms_output.put_line('vln_tinggi_kolom = '||to_char(vln_tinggi_kolom));
	   --dbms_output.put_line('vln_lebar_bentang = '||to_char(vln_lebar_bentang));
	   --dbms_output.put_line('vln_keliling_dinding = '||to_char(vln_keliling_dinding));
	   --dbms_output.put_line('vln_luas_mezzanine = '||to_char(vln_luas_mezzanine));
	   --dbms_output.put_line('vlc_type_konstruksi = '||vlc_type_konstruksi);
	BEGIN
	  SELECT coalesce(nilai_dbkb_jpb3, 0)
	  INTO STRICT 	 vln_nilai_komponen_utama
	  FROM 	 dbkb_jpb3
	  WHERE  kd_propinsi               = vlc_kd_propinsi
	    AND  kd_dati2 				   = vlc_kd_dati2
	  	AND  thn_dbkb_jpb3 			   = vlc_tahun
	  	AND  lbr_bent_min_dbkb_jpb3   <= vln_lebar_bentang
	  	AND  lbr_bent_max_dbkb_jpb3   >= vln_lebar_bentang
	  	AND  ting_kolom_min_dbkb_jpb3 <= vln_tinggi_kolom
	  	AND  ting_kolom_max_dbkb_jpb3 >= vln_tinggi_kolom;

	EXCEPTION
	  WHEN OTHERS THEN vln_nilai_komponen_utama := 0;
  	END;

	   --dbms_output.put_line('vln_nilai_komponen_utama = '||to_char(vln_nilai_komponen_utama));
    ---------------------------------------------------------------------------------
    --- Menentukan Biaya Komponen Material /m2
    ---------------------------------------------------------------------------------
    BEGIN
	  SELECT jns_atap_bng,
	  		 kd_lantai,
			 kd_langit_langit,
			 coalesce(luas_bng, 0),
			 thn_dibangun_bng,
			 thn_renovasi_bng,
			 kondisi_bng,
			 kd_dinding,
			 jml_lantai_bng
	  INTO STRICT   vlc_atap,
	  		 vlc_lantai,
			 vlc_langit_langit,
			 vln_luas_bng,
	  		 vlc_tahun_dibangun,
			 vlc_tahun_renovasi,
			 vlc_kondisi_bng,
			 vlc_dinding,
			 vln_jml_lantai_bng
	  FROM   dat_op_bangunan
	  WHERE  kd_propinsi  = vlc_kd_propinsi
	    AND  kd_dati2     = vlc_kd_dati2
	  	AND  kd_kecamatan = vlc_kd_kecamatan
	  	AND  kd_kelurahan = vlc_kd_kelurahan
	  	AND  kd_blok 	  = vlc_kd_blok
	  	AND  no_urut 	  = vlc_no_urut
	  	AND  kd_jns_op 	  = vlc_kd_jns_op
	  	AND  no_bng 	  = vln_no_bng
	  	AND  kd_jpb 	  = '03';
    EXCEPTION
  	  WHEN   OTHERS THEN
	  		 vlc_atap	  		 := null;
	  		 vlc_lantai			 := null;
			 vlc_langit_langit	 := null;
			 vln_luas_bng		 := 0;
	  		 vlc_tahun_dibangun	 := null;
			 vlc_tahun_renovasi	 := null;
			 vlc_kondisi_bng	 := null;
			 vlc_dinding		 := null;
			 vln_jml_lantai_bng	 := 0;
    END;

    ---------------------------------------------------------------------------------
	--- Mencari Nilai Atap
    ---------------------------------------------------------------------------------
	BEGIN
	  SELECT coalesce(nilai_dbkb_material, 0)
	  INTO STRICT 	 vln_nilai_atap
	  FROM 	 dbkb_material
	  WHERE  kd_propinsi       = vlc_kd_propinsi
	    AND  kd_dati2 		   = vlc_kd_dati2
	  	AND  thn_dbkb_material = vlc_tahun
	  	AND  kd_pekerjaan 	   = '23'
	  	AND  kd_kegiatan 	   = '0'||vlc_atap;

  	EXCEPTION
  	  WHEN   OTHERS THEN vln_nilai_atap := 0;
  	END;

	vln_nilai_atap := vln_nilai_atap / coalesce(vln_jml_lantai_bng,1);
    ---------------------------------------------------------------------------------
	--- Mencari Nilai Lantai
    ---------------------------------------------------------------------------------
	BEGIN
	  SELECT coalesce(nilai_dbkb_material, 0)
	  INTO STRICT 	 vln_nilai_lantai
	  FROM 	 dbkb_material
	  WHERE  kd_propinsi       = vlc_kd_propinsi
	    AND  kd_dati2 		   = vlc_kd_dati2
	  	AND  thn_dbkb_material = vlc_tahun
	  	AND  kd_pekerjaan 	   = '22'
	  	AND  kd_kegiatan 	   = '0'||vlc_lantai;

  	EXCEPTION
  	  WHEN   OTHERS THEN vln_nilai_lantai := 0;
  	END;

    ---------------------------------------------------------------------------------
	--- Mencari Nilai Langit-langit
    ---------------------------------------------------------------------------------
	BEGIN
	  SELECT coalesce(nilai_dbkb_material, 0)
	  INTO STRICT 	 vln_nilai_langit_langit
	  FROM 	 dbkb_material
	  WHERE  kd_propinsi       = vlc_kd_propinsi
	  	AND  kd_dati2          = vlc_kd_dati2
	  	AND  thn_dbkb_material = vlc_tahun
	  	AND  kd_pekerjaan      = '24'
	  	AND  kd_kegiatan       = '0'||vlc_langit_langit;

  	EXCEPTION
  	  WHEN   OTHERS THEN vln_nilai_langit_langit := 0;
	END;

	vln_nilai_material := (vln_nilai_atap +
	                       vln_nilai_lantai +
						   vln_nilai_langit_langit) *
						  (1.3);

    ---------------------------------------------------------------------------------
    --- Menentukan Daya Dukung Lantai
    ---------------------------------------------------------------------------------
 	BEGIN
	  SELECT coalesce(nilai_dbkb_daya_dukung, 0)
	  INTO STRICT   vln_nilai_daya_dukung
	  FROM 	 dbkb_daya_dukung
	  WHERE  kd_propinsi          = vlc_kd_propinsi
	    AND  kd_dati2             = vlc_kd_dati2
	  	AND  thn_dbkb_daya_dukung = vlc_tahun
	  	AND  type_konstruksi      = vlc_type_konstruksi;

    EXCEPTION
  	  WHEN OTHERS THEN vln_nilai_daya_dukung := 0;
    END;

	   --dbms_output.put_line('vln_nilai_atap = '||to_char(vln_nilai_atap));
	   --dbms_output.put_line('vln_nilai_lantai = '||to_char(vln_nilai_lantai));
	   --dbms_output.put_line('vln_nilai_langit_langit = '||to_char(vln_nilai_langit_langit));
	   --dbms_output.put_line('vln_nilai_material = '||to_char(vln_nilai_material));
	   --dbms_output.put_line('vln_nilai_daya_dukung = '||to_char(vln_nilai_daya_dukung));
  ---------------------------------------------------------------------------------
  -- Menentukan Fasilitas / m2
  ---------------------------------------------------------------------------------
  vln_nilai_fasilitas := 0;

  vln_nilai_fasilitas := FASILITAS_SUSUT_X_LUAS(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, '03', NULL, vlc_tahun, vln_nilai_fasilitas);

	   --dbms_output.put_line('vln_nilai_fasilitas = '||to_char(vln_nilai_fasilitas));
  ---------------------------------------------------------------------------------
  --- Nilai Total / m2
  ---------------------------------------------------------------------------------
  vln_nilai_total_per_m2 := vln_nilai_komponen_utama +
          				    vln_nilai_material +
  							vln_nilai_daya_dukung +
							vln_nilai_fasilitas;

	   --dbms_output.put_line('vln_nilai_total_per_m2 = '||to_char(vln_nilai_total_per_m2));
  ---------------------------------------------------------------------------------
  --- Menghitung Nilai Total / m2 dikali luas
  ---------------------------------------------------------------------------------
  vln_nilai_total_kali_luas := vln_nilai_total_per_m2 * vln_luas_bng;
	   --dbms_output.put_line('vln_nilai_total_kali_luas = '||to_char(vln_nilai_total_kali_luas));
  ---------------------------------------------------------------------------------
  --- Menghitung Nilai dinding
  --  Jenis dinding	   		  		    Jenis Kegiatan Dinding
  --      1  >>  Kaca/Aluminium       	     01  >>  Kaca
  --      2  >>  Beton						 02	 >>	 Aluminium / Spandek
  --	  3  >>  Batu Bata/Conblok			 03	 >>	 Beton
  --	  4  >>  Kayu 						 04	 >>  Batu Bata
  --	  5  >>  Seng						 05	 >>	 Kayu
  --	  6  >>  Tidak ada					 06  >>  Seng
  ---------------------------------------------------------------------------------
  --------------------------------------
  -- diubah teguh tanggal 26/10/2000
  --------------------------------------
  IF    vlc_dinding = '1' THEN vlc_cari_dinding := '09'; -- bukan '01';
  ELSIF vlc_dinding = '2' THEN vlc_cari_dinding := '02';
  ELSIF vlc_dinding = '3' THEN vlc_cari_dinding := '03';
  ELSIF vlc_dinding = '4' THEN vlc_cari_dinding := '07';
  ELSIF vlc_dinding = '5' THEN vlc_cari_dinding := '08';
  ELSIF vlc_dinding = '6' THEN vlc_cari_dinding := null;
  END IF;
    ---------------------------------------------------------------------------------
 	--- Mencari Nilai dinding
    ---------------------------------------------------------------------------------
	BEGIN
	  SELECT coalesce(nilai_dbkb_material, 0)
	  INTO STRICT   vln_nilai_dinding
	  FROM   dbkb_material
	  WHERE  kd_propinsi       = vlc_kd_propinsi
	    AND  kd_dati2          = vlc_kd_dati2
	    AND  thn_dbkb_material = vlc_tahun
	  	AND  kd_pekerjaan      = '21'
	  	AND  kd_kegiatan       = vlc_cari_dinding;

    EXCEPTION
  	  WHEN   OTHERS THEN vln_nilai_dinding := 0;
	END;

	vln_total_nilai_dinding := (vln_keliling_dinding *
	                            vln_tinggi_kolom *
	 						    (10/6) *
							    vln_nilai_dinding) *
							   (1.3);

	   --dbms_output.put_line('vln_total_nilai_dinding = '||to_char(vln_total_nilai_dinding));
	---------------------------------------------------------------------------------
	--- Menghitung Nilai Mezzanine
	---------------------------------------------------------------------------------
	BEGIN
	  SELECT coalesce(nilai_dbkb_mezanin, 0)
	  INTO STRICT   vln_nilai_mezzanine
	  FROM   dbkb_mezanin
	  WHERE  kd_propinsi      = vlc_kd_propinsi
	    AND  kd_dati2         = vlc_kd_dati2
	    AND  thn_dbkb_mezanin = vlc_tahun;

    EXCEPTION
  	  WHEN   OTHERS THEN vln_nilai_mezzanine := 0;
	END;

	vln_nilai_total_mezzanine := vln_luas_mezzanine * vln_nilai_mezzanine;

	   --dbms_output.put_line('vln_nilai_total_mezzanine = '||to_char(vln_nilai_total_mezzanine));
	---------------------------------------------------------------------------------
	--- Menghitung Nilai Fasilitas yang disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_fasilitas_susut := 0;

	vln_nilai_fasilitas_susut := FASILITAS_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vln_jml_lantai_bng, vlc_tahun, vln_nilai_fasilitas_susut);

	   --dbms_output.put_line('vln_nilai_fasilitas_susut = '||to_char(vln_nilai_fasilitas_susut));
	---------------------------------------------------------------------------------
	--- Menghitung Nilai sebelum disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_sebelum_susut := vln_nilai_total_kali_luas +
	     					   vln_total_nilai_dinding +
							   vln_nilai_total_mezzanine +
							   vln_nilai_fasilitas_susut;

	   --dbms_output.put_line('vln_nilai_sebelum_susut = '||to_char(vln_nilai_sebelum_susut));
	---------------------------------------------------------------------------------
	--- Menhitung Penyusutan Bangunan
	---------------------------------------------------------------------------------
	vln_persentase_penyusutan := SUSUT(vlc_tahun,
	 						  	 	   vlc_tahun_dibangun,
 		 							   vlc_tahun_renovasi,
									   vlc_kondisi_bng,
									   vln_nilai_sebelum_susut,
									   vln_luas_bng,
									   0);

	   --dbms_output.put_line('vln_persentase_penyusutan = '||to_char(vln_persentase_penyusutan));
	---------------------------------------------------------------------------------
	--- Menghitung Nilai Setelah disusutkan
	---------------------------------------------------------------------------------
    vln_persentase_penyusutan  := coalesce(vln_persentase_penyusutan,0) / 100;
	   --dbms_output.put_line('vln_persentase_penyusutan = '||to_char(vln_persentase_penyusutan));
    vln_nilai_setelah_susut    := vln_nilai_sebelum_susut - (vln_nilai_sebelum_susut * vln_persentase_penyusutan);

	   --dbms_output.put_line('vln_nilai_setelah_susut = '||to_char(vln_nilai_setelah_susut));
	---------------------------------------------------------------------------------
	--- Menghitung Fasilitas Lain yang tidak disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_fasilitas_tdk_susut := 0;

	vln_nilai_fasilitas_tdk_susut := FASILITAS_TDK_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_nilai_fasilitas_tdk_susut);

	   --dbms_output.put_line('vln_nilai_fasilitas_tdk_susut = '||to_char(vln_nilai_fasilitas_tdk_susut));
	---------------------------------------------------------------------------------
	--- Total NJOP JPB 3
	---------------------------------------------------------------------------------
	vln_njop_jpb3 := vln_nilai_setelah_susut + vln_nilai_fasilitas_tdk_susut;
END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb4(IN vlc_kd_prop character, IN vlc_kd_dati2 character, IN vlc_kd_kec character, IN vlc_kd_kel character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vln_no_bng smallint, IN vlc_tahun character, INOUT vln_nilai_jpb4 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


   vlc_kls_jpb4         dat_jpb4.kls_jpb4%type;
   vln_nilai_dbkb_jpb4	decimal(17,2)				 			  := 0;
   vlc_kd_jpb   		dat_op_bangunan.kd_jpb%type;

   vln_luas_bng   		dat_op_bangunan.luas_bng%type;
   vlc_kondisi_bng 		dat_op_bangunan.kondisi_bng%type;
   vln_jml_lantai_bng   dat_op_bangunan.jml_lantai_bng%type;
   vln_komp_utama 		decimal(17,2)				 			  := 0;
   vln_nilai_fas1 		decimal(17,2)				 			  := 0;
   vln_nilai_fas2 		decimal(17,2)				 			  := 0;
   vln_nilai_fas3 		decimal(17,2)				 			  := 0;
   vln_nilai1     		decimal(17,2)				 			  := 0;
   vln_nilai_sbl_susut  decimal(17,2)				 			  := 0;
   vln_nilai_stl_susut  decimal(17,2)				 			  := 0;
   vlc_thn_dibangun     dat_op_bangunan.thn_dibangun_bng%type;
   vlc_thn_renovasi     dat_op_bangunan.thn_renovasi_bng%type;
   vln_besar_susut      decimal(17,2)				 			  := 0;
   vln_persen_susut     decimal(17,2)				 			  := 0;

/*---------------------------------
 DIBUAT OLEH : SUNARYO
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 06-10-2000
*/
---------------------------------
BEGIN
   SELECT kd_jpb,
   		  luas_bng,
	      thn_dibangun_bng,
          thn_renovasi_bng,
		  kondisi_bng,
		  jml_lantai_bng
   INTO STRICT   vlc_kd_jpb,
   		  vln_luas_bng,
		  vlc_thn_dibangun,
		  vlc_thn_renovasi,
   		  vlc_kondisi_bng,
		  vln_jml_lantai_bng
   FROM   dat_op_bangunan
   WHERE  kd_propinsi   = vlc_kd_prop    AND
	 	  kd_dati2 	    = vlc_kd_dati2   AND
	 	  kd_kecamatan  = vlc_kd_kec     AND
	 	  kd_kelurahan  = vlc_kd_kel     AND
	 	  kd_blok 	    = vlc_kd_blok    AND
	 	  no_urut 	    = vlc_no_urut    AND
	 	  kd_jns_op  	= vlc_kd_jns_op  AND
	 	  no_bng 		= vln_no_bng;

	 IF FOUND THEN
   	   BEGIN
      	  SELECT kls_jpb4
	  	  INTO STRICT   vlc_kls_jpb4
	  	  FROM   dat_jpb4
   	  	  WHERE  kd_propinsi   = vlc_kd_prop    AND
	 	  	 	 kd_dati2 	   = vlc_kd_dati2   AND
	 	  	 	 kd_kecamatan  = vlc_kd_kec     AND
	 	  	 	 kd_kelurahan  = vlc_kd_kel     AND
	 	  	 	 kd_blok 	   = vlc_kd_blok    AND
	 	  	 	 no_urut 	   = vlc_no_urut    AND
	 	  	 	 kd_jns_op     = vlc_kd_jns_op  AND
	 	  	 	 no_bng 	   = vln_no_bng;
   	   EXCEPTION
      	    WHEN   no_data_found THEN vlc_kls_jpb4 := null;
   	   END;
	   RAISE NOTICE 'vlc_kls_jpb4 = %', vlc_kls_jpb4;

	   BEGIN
     	  SELECT nilai_dbkb_jpb4
     	  INTO STRICT   vln_nilai_dbkb_jpb4
     	  FROM   dbkb_jpb4
     	  WHERE  kd_propinsi      = vlc_kd_prop        AND
             	 kd_dati2         = vlc_kd_dati2 	   AND
            	 thn_dbkb_jpb4    = vlc_tahun 	  	   AND
            	 kls_dbkb_jpb4    = vlc_kls_jpb4       AND
            	 lantai_min_jpb4 <= vln_jml_lantai_bng AND
            	 lantai_max_jpb4 >= vln_jml_lantai_bng;
   	   EXCEPTION
          WHEN   no_data_found THEN vln_nilai_dbkb_jpb4 := 0;
   	   END;

   	   vln_komp_utama := vln_nilai_dbkb_jpb4;
	   RAISE NOTICE 'vln_komp_utama = %', vln_komp_utama::text;

	   vln_nilai_fas1 := FASILITAS_SUSUT_X_LUAS(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_kd_jpb, vlc_kls_jpb4, vlc_tahun, vln_nilai_fas1);
	   RAISE NOTICE 'vln_nilai_fas1 = %', vln_nilai_fas1::text;

	   vln_nilai1 := (coalesce(vln_komp_utama,0) + coalesce(vln_nilai_fas1,0)) * coalesce(vln_luas_bng,0);
	   RAISE NOTICE 'vln_nilai1 = %', vln_nilai1::text;

	   vln_nilai_fas2 := FASILITAS_SUSUT(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vln_jml_lantai_bng, vlc_tahun, vln_nilai_fas2);
	   RAISE NOTICE 'vln_fasilitas_susut = %', vln_nilai_fas2::text;

	   vln_nilai_sbl_susut := coalesce(vln_nilai1,0) + coalesce(vln_nilai_fas2,0);
	   RAISE NOTICE 'vln_nilai_sbl_susut = %', vln_nilai_sbl_susut::text;

	   vln_besar_susut := SUSUT(vlc_tahun,
	                            vlc_thn_dibangun,
								vlc_thn_renovasi,
             			  		vlc_kondisi_bng,
								vln_nilai_sbl_susut,
								vln_luas_bng,
								0);
	   RAISE NOTICE 'vln_besar_susut = %', vln_besar_susut::text;

	   IF (vln_besar_susut IS NOT NULL AND vln_besar_susut::text <> '') OR (vln_besar_susut = 0) THEN
		  vln_persen_susut    := round((vln_besar_susut/100)::numeric, 2);
	      vln_nilai_stl_susut := (vln_nilai_sbl_susut -
		                         (vln_nilai_sbl_susut * vln_persen_susut));
	   ELSE
	      vln_nilai_stl_susut := vln_nilai_sbl_susut;
	   END IF;
	   RAISE NOTICE 'vln_nilai_stl_susut = %', vln_nilai_stl_susut::text;

       vln_nilai_fas3 := FASILITAS_TDK_SUSUT(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_nilai_fas3);
	   RAISE NOTICE 'vln_fasilitas_tdk_susut = %', vln_nilai_fas3::text;

	   vln_nilai_jpb4 := vln_nilai_stl_susut + coalesce(vln_nilai_fas3,0);
     ELSE
	   vln_nilai_jpb4 := 0;
	 END IF;

EXCEPTION
  WHEN no_data_found THEN vln_nilai_jpb4 := 0; --NULL;
END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb5(IN vlc_kd_propinsi character, IN vlc_kd_dati2 character, IN vlc_kd_kecamatan character, IN vlc_kd_kelurahan character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vln_no_bng smallint, IN vlc_tahun character, INOUT vln_nilai_jpb5 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


  -------------------------------------------------------------------------
  -- variable perhitungan nilai nilai jpb 5
  -------------------------------------------------------------------------
  vln_penyusutan        decimal(17,2)				 			  := 0; -- dari procedure fas_tdk_susut
  vlc_thn_dibangun_bng  dat_op_bangunan.thn_dibangun_bng%type;
  vlc_thn_renovasi_bng  dat_op_bangunan.thn_renovasi_bng%type;
  vln_luas_bng          dat_op_bangunan.luas_bng%type;
  vln_jml_lantai_bng    dat_op_bangunan.jml_lantai_bng%type;
  vlc_kondisi_bng       dat_op_bangunan.kondisi_bng%type;
  vln_nilai_dbkb_jpb5   decimal(17,2)				 			  := 0;
  vlc_kls_jpb5          dat_jpb5.kls_jpb5%type;
  vln_luas_kmr_jpb5  	dat_jpb5.luas_kmr_jpb5_dgn_ac_sent%type	  := 0;
  vln_luas_rng_lain  	dat_jpb5.luas_rng_lain_jpb5_dgn_ac_sent%type := 0;
  vln_jml_satuan        dat_fasilitas_bangunan.jml_satuan%type    := 0;
  vlc_kd_fasilitas      fasilitas.kd_fasilitas%type;
  vlc_status_fasilitas  fasilitas.status_fasilitas%type;
  vlc_ketergantungan    fasilitas.ketergantungan%type;
  vln_nilai_fasilitas   decimal(17,2)				 			  := 0;
  vln_nilai_satuan      decimal(17,2)				 			  := 0;

  -------------------------------------------------------------------------
  -- cursor untuk cari nilai satuan berdasarkan kode fasilitas yang ber-status '0' --
  -------------------------------------------------------------------------
  cur_fasilitas CURSOR FOR
     	 SELECT status_fasilitas,
		 		kd_fasilitas,
				ketergantungan
  	 	 FROM   fasilitas
  	 	 WHERE  status_fasilitas IN ('0','2','3')
     	 ORDER  BY status_fasilitas, kd_fasilitas, ketergantungan;

/*---------------------------------
 DIBUAT OLEH : TEGUH
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 06-10-2000
*/
---------------------------------
BEGIN
  BEGIN
       SELECT a.thn_dibangun_bng,
	   		  a.thn_renovasi_bng,
			  coalesce(a.luas_bng,0),
	   		  coalesce(a.jml_lantai_bng,0),
			  a.kondisi_bng,
			  b.kls_jpb5,
			  coalesce(b.luas_kmr_jpb5_dgn_ac_sent,0),
			  coalesce(b.luas_rng_lain_jpb5_dgn_ac_sent,0)
       INTO STRICT   vlc_thn_dibangun_bng,
	   		  vlc_thn_renovasi_bng,
			  vln_luas_bng,
			  vln_jml_lantai_bng,
              vlc_kondisi_bng,
			  vlc_kls_jpb5,
			  vln_luas_kmr_jpb5,
			  vln_luas_rng_lain
       FROM dat_op_bangunan a
LEFT OUTER JOIN dat_jpb5 b ON (a.kd_propinsi = b.kd_propinsi AND a.kd_dati2 = b.kd_dati2 AND a.kd_kecamatan = b.kd_kecamatan AND a.kd_kelurahan = b.kd_kelurahan AND a.kd_blok = b.kd_blok AND a.no_urut = b.no_urut AND a.kd_jns_op = b.kd_jns_op AND a.no_bng = b.no_bng)
WHERE a.kd_propinsi      = vlc_kd_propinsi AND a.kd_dati2         = vlc_kd_dati2 AND a.kd_kecamatan     = vlc_kd_kecamatan AND a.kd_kelurahan     = vlc_kd_kelurahan AND a.kd_blok          = vlc_kd_blok AND a.no_urut          = vlc_no_urut AND a.kd_jns_op        = vlc_kd_jns_op AND a.no_bng           = vln_no_bng AND a.kd_jpb           = '05';
  EXCEPTION
       WHEN   OTHERS THEN
       		  vlc_thn_dibangun_bng := null;
	   		  vlc_thn_renovasi_bng := null;
			  vln_luas_bng		   := 0;
			  vln_jml_lantai_bng   := 0;
              vlc_kondisi_bng	   := null;
			  vlc_kls_jpb5		   := null;
			  vln_luas_kmr_jpb5	   := 0;
			  vln_luas_rng_lain	   := 0;
  END;

  -------------------------------------------------------------------------
  --- cari nilai komponen utama / m2
  -------------------------------------------------------------------------
  BEGIN
       SELECT nilai_dbkb_jpb5
	   INTO STRICT   vln_nilai_dbkb_jpb5
       FROM   dbkb_jpb5
       WHERE  kd_propinsi      = vlc_kd_propinsi    AND
	   		  kd_dati2         = vlc_kd_dati2       AND
 	   		  thn_dbkb_jpb5    = vlc_tahun          AND
 	   		  kls_dbkb_jpb5    = vlc_kls_jpb5       AND
 	   		  lantai_min_jpb5 <= vln_jml_lantai_bng AND
 	   		  lantai_max_jpb5 >= vln_jml_lantai_bng;
  EXCEPTION
       WHEN   OTHERS THEN
			  vln_nilai_dbkb_jpb5 := 0;
  END;
  --dbms_output.put_line('vlc_kls_jpb5 = '||vlc_kls_jpb5);
  --dbms_output.put_line('vln_nilai_dbkb_jpb5 = '||to_char(vln_nilai_dbkb_jpb5));
  -------------------------------------------------------------------------
  --- cari nilai komponen utama X luas bangunan
  -------------------------------------------------------------------------
  vln_nilai_dbkb_jpb5 := vln_nilai_dbkb_jpb5 * vln_luas_bng;
  --dbms_output.put_line('vln_nilai_x_luas = '||to_char(vln_nilai_dbkb_jpb5));
  -------------------------------------------------------------------------
  --- cari nilai fasilitas yang dipengaruhi luas, jumlah kamar, luas kamar
  -------------------------------------------------------------------------
  vln_nilai_fasilitas := 0;
  OPEN  cur_fasilitas;
  LOOP
	  FETCH cur_fasilitas
	  INTO  vlc_status_fasilitas,
	  		vlc_kd_fasilitas,
			vlc_ketergantungan;
	  EXIT WHEN NOT FOUND;/* apply on cur_fasilitas */

	  IF vlc_status_fasilitas = '0' THEN
	  	 BEGIN
		  	   SELECT coalesce(jml_satuan, 0)
			   INTO STRICT   vln_jml_satuan
		  	   FROM   dat_fasilitas_bangunan
		  	   WHERE  kd_propinsi  = vlc_kd_propinsi  AND
			   		  kd_dati2     = vlc_kd_dati2	  AND
					  kd_kecamatan = vlc_kd_kecamatan AND
					  kd_kelurahan = vlc_kd_kelurahan AND
					  kd_blok      = vlc_kd_blok      AND
					  no_urut      = vlc_no_urut  	  AND
					  kd_jns_op    = vlc_kd_jns_op    AND
					  no_bng       = vln_no_bng       AND
					  kd_fasilitas = vlc_kd_fasilitas;
	  	 EXCEPTION
		       WHEN   no_data_found THEN vln_jml_satuan := 0;
	  	 END;
	  END IF;

	  IF vlc_ketergantungan = '0' THEN
	  	 BEGIN
	     	  SELECT coalesce(nilai_non_dep, 0)
			  INTO STRICT   vln_nilai_satuan
	     	  FROM   fas_non_dep
	    	  WHERE  kd_propinsi  = vlc_kd_propinsi  AND
		   	  		 kd_dati2     = vlc_kd_dati2     AND
		   			 thn_non_dep  = vlc_tahun        AND
		   			 kd_fasilitas = vlc_kd_fasilitas;
	  	 EXCEPTION
	          WHEN   no_data_found THEN vln_nilai_satuan := 0;
	  	 END;
	  ELSIF vlc_ketergantungan = '1' THEN
	  		BEGIN
	    		 SELECT coalesce(nilai_dep_min_max, 0)
				 INTO STRICT   vln_nilai_satuan
	    		 FROM   fas_dep_min_max
	    		 WHERE  kd_propinsi     = vlc_kd_propinsi   AND
		   		 		kd_dati2        = vlc_kd_dati2      AND
		   		 		thn_dep_min_max = vlc_tahun         AND
		   		 		kd_fasilitas    = vlc_kd_fasilitas  AND
		   		 		kls_dep_min    <= vln_jml_satuan 	AND
		   		 		kls_dep_max    >= vln_jml_satuan;
	  		EXCEPTION
	    	     WHEN   no_data_found THEN vln_nilai_satuan := 0;
	  		END;
	  ELSIF vlc_ketergantungan = '2' THEN
	  		BEGIN
	    		 SELECT coalesce(nilai_fasilitas_kls_bintang, 0)
				 INTO STRICT   vln_nilai_satuan
	    		 FROM   fas_dep_jpb_kls_bintang
	    		 WHERE  kd_propinsi     	    = vlc_kd_propinsi   AND
		   		   		kd_dati2        	    = vlc_kd_dati2      AND
		   		   		thn_dep_jpb_kls_bintang = vlc_tahun         AND
		   		   		kd_fasilitas    	    = vlc_kd_fasilitas  AND
		   		   		kd_jpb		    		= '05'              AND
		   		   		kls_bintang    	    	= vlc_kls_jpb5;
	  		EXCEPTION
	    	     WHEN 	no_data_found THEN vln_nilai_satuan := 0;
	  		END;
	  ELSE vln_nilai_satuan := 0;
	  END IF;

    ------------------------------------------------------------------------------
    --- penentuan nilai fasilitas yang dipengaruhi luas, jumlah kamar, luas kamar
    ------------------------------------------------------------------------------
	IF vlc_status_fasilitas = '0'  THEN
	   vln_nilai_fasilitas := vln_nilai_fasilitas +
	   					     (vln_nilai_satuan * vln_jml_satuan * vln_luas_bng);
	ELSIF vlc_status_fasilitas = '2'  THEN
	   vln_nilai_fasilitas := vln_nilai_fasilitas +
	   					     (vln_nilai_satuan * vln_luas_kmr_jpb5);
	ELSIF vlc_status_fasilitas = '3'  THEN
	   vln_nilai_fasilitas := vln_nilai_fasilitas +
	                         (vln_nilai_satuan * vln_luas_rng_lain);
	ELSE vln_nilai_fasilitas := vln_nilai_fasilitas;
    END IF;

  END LOOP;
  CLOSE cur_fasilitas;
  --dbms_output.put_line('vln_nilai_fasilitas = '||to_char(vln_nilai_fasilitas));
  -------------------------------------------------------------------------
  --- cari nilai komponen utama + nilai fasilitas
  -------------------------------------------------------------------------
  vln_nilai_jpb5       := vln_nilai_dbkb_jpb5 + vln_nilai_fasilitas;
  --dbms_output.put_line('vln_nilai_jpb5 = '||to_char(vln_nilai_jpb5));
  -------------------------------------------------------------------------
  --- cari nilai fasilitas yang disusutkan
  -------------------------------------------------------------------------
  vln_nilai_fasilitas := 0;
  vln_nilai_fasilitas := FASILITAS_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vln_jml_lantai_bng, vlc_tahun, vln_nilai_fasilitas);
  --dbms_output.put_line('vln_nilai_fasilitas = '||to_char(vln_nilai_fasilitas));
  -------------------------------------------------------------------------
  --- cari nilai sebelum disusutkan
  -------------------------------------------------------------------------
  vln_nilai_jpb5       := vln_nilai_jpb5 + coalesce(vln_nilai_fasilitas,0);
  --dbms_output.put_line('vln_nilai_jpb5 = '||to_char(vln_nilai_jpb5));
  -------------------------------------------------------------------------
  --- cari prosentase penyusutan
  -------------------------------------------------------------------------
  vln_penyusutan      := SUSUT(vlc_tahun,
  					  	 	   vlc_thn_dibangun_bng,
							   vlc_thn_renovasi_bng,
                               vlc_kondisi_bng,
							   vln_nilai_jpb5,
							   vln_luas_bng,
							   0);
  --dbms_output.put_line('vln_penyusutan = '||to_char(vln_penyusutan));
  -------------------------------------------------------------------------
  --- cari nilai setelah disusutkan
  -------------------------------------------------------------------------
  IF (vln_penyusutan IS NOT NULL AND vln_penyusutan::text <> '') OR (vln_penyusutan = 0)  THEN
	  vln_penyusutan  := round((vln_penyusutan / 100)::numeric,2);
	  vln_nilai_jpb5  := vln_nilai_jpb5 -
	  		  	         (vln_nilai_jpb5 * vln_penyusutan);
  ELSE
	  vln_nilai_jpb5  := vln_nilai_jpb5;
  END IF;
  --dbms_output.put_line('vln_nilai_jpb5 = '||to_char(vln_nilai_jpb5));
  -------------------------------------------------------------------------
  --- cari nilai fasilitas yang tidak disusutkan
  -------------------------------------------------------------------------
  vln_nilai_fasilitas := 0;
  vln_nilai_fasilitas := FASILITAS_TDK_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_nilai_fasilitas);
  --dbms_output.put_line('vln_nilai_fasilitas = '||to_char(vln_nilai_fasilitas));
  -------------------------------------------------------------------------
  --- cari nilai jpb5
  -------------------------------------------------------------------------
  vln_nilai_jpb5       := vln_nilai_jpb5 + vln_nilai_fasilitas;

END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb6(IN vlc_kd_propinsi text, IN vlc_kd_dati2 text, IN vlc_kd_kecamatan text, IN vlc_kd_kelurahan text, IN vlc_kd_blok text, IN vlc_no_urut text, IN vlc_kd_jns_op text, IN vln_no_bng bigint, IN vlc_tahun text, INOUT vln_njop_jpb6 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


	vlc_kls_jpb6                    dat_jpb6.kls_jpb6%type;
	vln_nilai_komponen_utama 		decimal(17,2)				 		   := 0;
	vln_luas_bng 					dat_op_bangunan.luas_bng%type 		   := 0;
	vlc_tahun_dibangun 				dat_op_bangunan.thn_dibangun_bng%type;
	vlc_tahun_renovasi 				dat_op_bangunan.thn_renovasi_bng%type;
	vlc_kondisi_bng 				dat_op_bangunan.kondisi_bng%type;
	vlc_atap 						dat_op_bangunan.jns_atap_bng%type;
	vlc_lantai 						dat_op_bangunan.kd_lantai%type;
	vlc_langit_langit 				dat_op_bangunan.kd_langit_langit%type;
	vln_jml_lantai_bng				dat_op_bangunan.jml_lantai_bng%type    := 0;
	vln_nilai_atap 					decimal(17,2)				 		   := 0;
	vln_nilai_lantai 				decimal(17,2)				 		   := 0;
	vln_nilai_langit_langit 		decimal(17,2)				 		   := 0;
	vlc_dinding 					dat_op_bangunan.kd_dinding%type;
	vlc_cari_dinding 				dbkb_material.kd_kegiatan%type;
	vln_nilai_dinding_temp 			decimal(17,2)				 		   := 0;
	vln_nilai_dinding_plester 		decimal(17,2)				 		   := 0;
	vln_nilai_dinding_cat 			decimal(17,2)				 		   := 0;
	vln_nilai_dinding 				decimal(17,2)				 		   := 0;
	vln_nilai_material 				decimal(17,2)				 		   := 0;
	vln_nilai_fasilitas 			decimal(17,2)				 		   := 0;
	vln_nilai_total_per_m2 			decimal(17,2)				 		   := 0;
	vln_nilai_total_kali_luas 		decimal(17,2)				 		   := 0;
	vln_nilai_fasilitas_susut 		decimal(17,2)				 		   := 0;
	vln_nilai_sebelum_susut 		decimal(17,2)				 		   := 0;
	vln_persentase_penyusutan 		decimal(17,2)				 		   := 0;
	vln_persen_susut				decimal(17,2)				 		   := 0;
	vln_nilai_setelah_susut 		decimal(17,2)				 		   := 0;
	vln_nilai_fasilitas_tdk_susut   decimal(17,2)				 		   := 0;

/*---------------------------------
 DIBUAT OLEH : MADE
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH - RACHMAT
 TGL. REVISI :
*/
---------------------------------
BEGIN
  -------------------------------------------------------------------------------
  --- Menentukan biaya komponen utama /m2
  -------------------------------------------------------------------------------
  BEGIN
	  SELECT kls_jpb6
	  INTO STRICT   vlc_kls_jpb6
	  FROM 	 dat_jpb6
	  WHERE  kd_propinsi  = vlc_kd_propinsi
	    AND  kd_dati2 	  = vlc_kd_dati2
	  	AND  kd_kecamatan = vlc_kd_kecamatan
	  	AND  kd_kelurahan = vlc_kd_kelurahan
	  	AND  kd_blok 	  = vlc_kd_blok
	  	AND  no_urut 	  = vlc_no_urut
	  	AND  kd_jns_op 	  = vlc_kd_jns_op
	  	AND  no_bng 	  = vln_no_bng;

  EXCEPTION
  	WHEN OTHERS THEN vlc_kls_jpb6 := null;
  END;

  BEGIN
	  SELECT coalesce(nilai_dbkb_jpb6, 0)
	  INTO STRICT   vln_nilai_komponen_utama
	  FROM   dbkb_jpb6
	  WHERE  kd_propinsi   = vlc_kd_propinsi
	    AND  kd_dati2      = vlc_kd_dati2
	  	AND  thn_dbkb_jpb6 = vlc_tahun
	  	AND  kls_dbkb_jpb6 = vlc_kls_jpb6;

  EXCEPTION
	  WHEN   OTHERS THEN vln_nilai_komponen_utama := 0;
  END;

  ---------------------------------------------------------------------------------
  --- Mengambil luas bangunan, tahun, dsb.
  ---------------------------------------------------------------------------------
  BEGIN
   	  SELECT coalesce(luas_bng, 0),
	         thn_dibangun_bng,
			 thn_renovasi_bng,
			 kondisi_bng,
			 jml_lantai_bng
	  INTO STRICT   vln_luas_bng,
	  		 vlc_tahun_dibangun,
			 vlc_tahun_renovasi,
			 vlc_kondisi_bng,
			 vln_jml_lantai_bng
	  FROM   dat_op_bangunan
	  WHERE  kd_propinsi  = vlc_kd_propinsi
	    AND  kd_dati2 	  = vlc_kd_dati2
	    AND  kd_kecamatan = vlc_kd_kecamatan
	  	AND  kd_kelurahan = vlc_kd_kelurahan
	  	AND  kd_blok 	  = vlc_kd_blok
	  	AND  no_urut 	  = vlc_no_urut
	  	AND  kd_jns_op 	  = vlc_kd_jns_op
	  	AND  no_bng 	  = vln_no_bng
	  	AND  kd_jpb 	  = '06';
  EXCEPTION
  	  WHEN   OTHERS THEN
	  		 vln_luas_bng 		 := 0;
	  		 vlc_tahun_dibangun	 := null;
			 vlc_tahun_renovasi	 := null;
			 vlc_kondisi_bng	 := null;
			 vln_jml_lantai_bng	 := 0;
  END;

  ---------------------------------------------------------------------------------
  --- Menentukan Fasilitas / m2
  ---------------------------------------------------------------------------------
  vln_nilai_fasilitas := 0;

  vln_nilai_fasilitas := FASILITAS_SUSUT_X_LUAS(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, '06', vlc_kls_jpb6, vlc_tahun, vln_nilai_fasilitas);

  ---------------------------------------------------------------------------------
  --- Nilai Total / m2
  ---------------------------------------------------------------------------------
  vln_nilai_total_per_m2 := vln_nilai_komponen_utama + vln_nilai_fasilitas;

  ---------------------------------------------------------------------------------
  --- Menghitung Nilai Total / m2 dikali luas
  ---------------------------------------------------------------------------------
  vln_nilai_total_kali_luas := vln_nilai_total_per_m2 * vln_luas_bng;

	---------------------------------------------------------------------------------
	--- Menghitung Nilai Fasilitas yang disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_fasilitas_susut := 0;

	vln_nilai_fasilitas_susut := FASILITAS_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, coalesce(vln_jml_lantai_bng,0), vlc_tahun, vln_nilai_fasilitas_susut);

	---------------------------------------------------------------------------------
	--- Menghitung Nilai sebelum disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_sebelum_susut := vln_nilai_total_kali_luas + vln_nilai_fasilitas_susut;

	---------------------------------------------------------------------------------
	--- Menhitung Penyusutan Bangunan
	---------------------------------------------------------------------------------
	vln_persentase_penyusutan := SUSUT(vlc_tahun,
							           vlc_tahun_dibangun,
 		 							   vlc_tahun_renovasi,
									   vlc_kondisi_bng,
									   vln_nilai_sebelum_susut,
									   vln_luas_bng,
									   0);

	vln_persen_susut          := round((vln_persentase_penyusutan / 100)::numeric, 2);

	---------------------------------------------------------------------------------
	--- Menghitung Nilai Setelah disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_setelah_susut := vln_nilai_sebelum_susut -
							  (vln_nilai_sebelum_susut * vln_persen_susut);

	---------------------------------------------------------------------------------
	--- Menghitung Fasilitas Lain yang tidak disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_fasilitas_tdk_susut := 0;

	vln_nilai_fasilitas_tdk_susut := fasilitas_tdk_susut(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_nilai_fasilitas_tdk_susut);

	---------------------------------------------------------------------------------
	--- Total NJOP JPB 6
	---------------------------------------------------------------------------------
	vln_njop_jpb6 := vln_nilai_setelah_susut + vln_nilai_fasilitas_tdk_susut;

END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb7(IN vlc_kd_propinsi character, IN vlc_kd_dati2 character, IN vlc_kd_kecamatan character, IN vlc_kd_kelurahan character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vln_no_bng smallint, IN vlc_tahun character, INOUT vln_nilai_jpb7 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


  ------------------------------------------------------------------
  -- variable perhitungan nilai nilai jpb 7 --
  ------------------------------------------------------------------
  vln_penyusutan        decimal(17,2)				 		   := 0; -- dari procedure fas_tdk_susut
  vlc_thn_dibangun_bng  dat_op_bangunan.thn_dibangun_bng%type;
  vlc_thn_renovasi_bng  dat_op_bangunan.thn_renovasi_bng%type;
  vln_luas_bng          dat_op_bangunan.luas_bng%type;
  vln_jml_lantai_bng    dat_op_bangunan.jml_lantai_bng%type;
  vlc_kondisi_bng       dat_op_bangunan.kondisi_bng%type;
  vln_nilai_dbkb_jpb7   decimal(17,2)				 		   := 0;
  vlc_jns_jpb7      	dat_jpb7.jns_jpb7%type;
  vlc_bintang_jpb7      dat_jpb7.bintang_jpb7%type;
  vln_jml_kmr_jpb7      dat_jpb7.jml_kmr_jpb7%type 			   := 0;
  vln_luas_jpb7         dat_jpb7.luas_kmr_jpb7_dgn_ac_sent%type;
  vln_luas_jpb7_lain    dat_jpb7.luas_kmr_lain_jpb7_dgn_ac_sent%type := 0;
  vln_jml_satuan        dat_fasilitas_bangunan.jml_satuan%type := 0;
  vlc_kd_fasilitas      fasilitas.kd_fasilitas%type;
  vlc_status_fasilitas  fasilitas.status_fasilitas%type;
  vlc_ketergantungan    fasilitas.ketergantungan%type;
  vln_nilai_fasilitas   decimal(17,2)				 		   := 0;
  vln_fasilitas_susut   decimal(17,2)				 		   := 0;
  vln_fasilitas_tdk_susut decimal(17,2)				 		   := 0;
  vln_nilai_satuan      decimal(17,2)				 		   := 0;

  ------------------------------------------------------------------
  -- cursor untuk cari nilai fasilitas --
  ------------------------------------------------------------------
  cur_fasilitas CURSOR FOR
     	 SELECT status_fasilitas, kd_fasilitas, ketergantungan
  	 	 FROM   fasilitas
  	 	 WHERE  status_fasilitas IN ('0','1','2','3')
     	 ORDER  BY status_fasilitas, kd_fasilitas, ketergantungan;

/*---------------------------------
 DIBUAT OLEH : TEGUH
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 09-10-2000
*/
---------------------------------
BEGIN
  ------------------------------------------------------------------
  -- seek nilai komponen utama dbkb jpb 7 dari tabel DBKB_JPB7 --
  ------------------------------------------------------------------
  BEGIN
       SELECT a.thn_dibangun_bng,
	   		  a.thn_renovasi_bng,
			  coalesce(a.luas_bng,0),
			  coalesce(a.jml_lantai_bng,0),
			  a.kondisi_bng,
			  b.jns_jpb7,
			  b.bintang_jpb7,
			  coalesce(b.jml_kmr_jpb7,0),
			  coalesce(b.luas_kmr_jpb7_dgn_ac_sent,0),
			  coalesce(b.luas_kmr_lain_jpb7_dgn_ac_sent,0)
       INTO STRICT   vlc_thn_dibangun_bng,
	   		  vlc_thn_renovasi_bng,
			  vln_luas_bng,
			  vln_jml_lantai_bng,
              vlc_kondisi_bng,
			  vlc_jns_jpb7,
			  vlc_bintang_jpb7,
			  vln_jml_kmr_jpb7,
              vln_luas_jpb7,
			  vln_luas_jpb7_lain
       FROM dat_op_bangunan a
LEFT OUTER JOIN dat_jpb7 b ON (a.kd_propinsi = b.kd_propinsi AND a.kd_dati2 = b.kd_dati2 AND a.kd_kecamatan = b.kd_kecamatan AND a.kd_kelurahan = b.kd_kelurahan AND a.kd_blok = b.kd_blok AND a.no_urut = b.no_urut AND a.kd_jns_op = b.kd_jns_op AND a.no_bng = b.no_bng)
WHERE a.kd_propinsi      = vlc_kd_propinsi AND a.kd_dati2         = vlc_kd_dati2 AND a.kd_kecamatan     = vlc_kd_kecamatan AND a.kd_kelurahan     = vlc_kd_kelurahan AND a.kd_blok          = vlc_kd_blok AND a.no_urut          = vlc_no_urut AND a.kd_jns_op        = vlc_kd_jns_op AND a.no_bng           = vln_no_bng AND a.kd_jpb           = '07';
  EXCEPTION
       WHEN   OTHERS THEN
       		  vlc_thn_dibangun_bng := null;
	   		  vlc_thn_renovasi_bng := null;
			  vln_luas_bng		   := 0;
			  vln_jml_lantai_bng   := 0;
              vlc_kondisi_bng	   := null;
			  vlc_jns_jpb7		   := null;
			  vlc_bintang_jpb7	   := null;
			  vln_jml_kmr_jpb7	   := null;
              vln_luas_jpb7		   := 0;
			  vln_luas_jpb7_lain   := 0;
  END;

  ------------------------------------------------------------------
  -- seek nilai komponen utama dbkb jpb 7 dari tabel DBKB_JPB7 --
  ------------------------------------------------------------------
  -- jika bintang '0' ubah menjadi bintang '5',
  -- diedit Pak Edy, Tgl. 21/10/2000
  ------------------------------------------------------------------
  IF vlc_bintang_jpb7 = '0' THEN
  	 vlc_bintang_jpb7 := '5';
  END IF;
  --dbms_output.put_line('vlc_bintang_jpb7 = '||vlc_bintang_jpb7);
  BEGIN
	   SELECT nilai_dbkb_jpb7
	   INTO STRICT   vln_nilai_dbkb_jpb7
	   FROM   dbkb_jpb7
	   WHERE  kd_propinsi       = vlc_kd_propinsi     AND
			  kd_dati2          = vlc_kd_dati2        AND
		 	  thn_dbkb_jpb7     = vlc_tahun           AND
		 	  jns_dbkb_jpb7 	= vlc_jns_jpb7    	  AND
		 	  bintang_dbkb_jpb7 = vlc_bintang_jpb7    AND
			  lantai_min_jpb7  <= vln_jml_lantai_bng  AND
		 	  lantai_max_jpb7  >= vln_jml_lantai_bng;
  EXCEPTION
       WHEN   OTHERS THEN
	   		  vln_nilai_dbkb_jpb7 := 0;
  END;
  --dbms_output.put_line('vln_nilai_dbkb_jpb7 = '||to_char(vln_nilai_dbkb_jpb7));
  ------------------------------------------------------------------
  -- nilai komponen utama X luas bangunan
  ------------------------------------------------------------------
  vln_nilai_dbkb_jpb7 := vln_nilai_dbkb_jpb7 * vln_luas_bng;
  --dbms_output.put_line('vln_nilai_dbkb_jpb7 = '||to_char(vln_nilai_dbkb_jpb7));
  -------------------------------------------------------------------------
  -- nilai biaya fasilitas yang dipengaruhi luas, jumlah kamar, luas kamar
  -------------------------------------------------------------------------
  vln_nilai_fasilitas := 0;
  OPEN  cur_fasilitas;
  LOOP
      FETCH cur_fasilitas
	  INTO  vlc_status_fasilitas,
	  		vlc_kd_fasilitas,
			vlc_ketergantungan;

	  EXIT WHEN NOT FOUND;/* apply on cur_fasilitas */

	  BEGIN
		  	SELECT coalesce(jml_satuan, 0)
			INTO STRICT   vln_jml_satuan
		  	FROM   dat_fasilitas_bangunan
		  	WHERE  kd_propinsi  = vlc_kd_propinsi  AND
			       kd_dati2     = vlc_kd_dati2	   AND
			       kd_kecamatan = vlc_kd_kecamatan AND
			       kd_kelurahan = vlc_kd_kelurahan AND
			       kd_blok      = vlc_kd_blok      AND
			       no_urut      = vlc_no_urut  	   AND
			       kd_jns_op    = vlc_kd_jns_op    AND
			       no_bng       = vln_no_bng       AND
			       kd_fasilitas = vlc_kd_fasilitas;
	  EXCEPTION
		     WHEN  no_data_found THEN vln_jml_satuan := 0;
	  END;

	  IF vlc_ketergantungan = '0' THEN
	    BEGIN
	    	 SELECT coalesce(nilai_non_dep, 0)
			 INTO STRICT 	vln_nilai_satuan
	     	 FROM   fas_non_dep
	    	 WHERE  kd_propinsi  = vlc_kd_propinsi  AND
		   	 		kd_dati2     = vlc_kd_dati2     AND
		   			thn_non_dep  = vlc_tahun        AND
		   			kd_fasilitas = vlc_kd_fasilitas;
	    EXCEPTION
	         WHEN   no_data_found THEN vln_nilai_satuan := 0;
	    END;
	  ELSIF vlc_ketergantungan = '1' THEN
	       BEGIN
	       	    SELECT coalesce(nilai_dep_min_max, 0)
				INTO STRICT   vln_nilai_satuan
	       	    FROM   fas_dep_min_max
	            WHERE  kd_propinsi     = vlc_kd_propinsi  AND
		           	   kd_dati2        = vlc_kd_dati2     AND
		           	   thn_dep_min_max = vlc_tahun        AND
		           	   kd_fasilitas    = vlc_kd_fasilitas AND
		           	   kls_dep_min    <= vln_jml_satuan   AND
		           	   kls_dep_max    >= vln_jml_satuan;
	       EXCEPTION
	    	    WHEN no_data_found THEN vln_nilai_satuan := 0;
	       END;
	  ELSIF vlc_ketergantungan = '2' THEN
	       BEGIN
	    	    SELECT coalesce(nilai_fasilitas_kls_bintang, 0)
				INTO STRICT   vln_nilai_satuan
	    	    FROM   fas_dep_jpb_kls_bintang
	    	    WHERE  kd_propinsi     	   		= vlc_kd_propinsi   AND
		           	   kd_dati2        	   		= vlc_kd_dati2      AND
		   	   		   thn_dep_jpb_kls_bintang 	= vlc_tahun         AND
		   	   		   kd_fasilitas    	   		= vlc_kd_fasilitas  AND
		   	   		   kd_jpb		   			= '07'              AND
		   	   		   kls_bintang    	   		= vlc_bintang_jpb7;
	       EXCEPTION
	    	    WHEN no_data_found THEN vln_nilai_satuan := 0;
	       END;
	  ELSE vln_nilai_satuan := 0;
	  END IF;

      ------------------------------------------------------------------------------
      -- penentuan biaya fasilitas yang dipengaruhi luas, jumlah kamar, luas kamar
      ------------------------------------------------------------------------------
	  IF vlc_status_fasilitas = '0'  THEN
	     vln_nilai_fasilitas := vln_nilai_fasilitas +
		 					    (vln_nilai_satuan * vln_jml_satuan * vln_luas_bng);
	  ELSIF vlc_status_fasilitas = '1'  THEN
	  		---------------------------------------------------------------------
	  		-- cari nilai boiler, anggap selalu ada
	  		---------------------------------------------------------------------
	        vln_nilai_fasilitas := vln_nilai_fasilitas +
								   (vln_nilai_satuan * vln_jml_kmr_jpb7);
	  ELSIF vlc_status_fasilitas = '2'  THEN
	  		---------------------------------------------------------------------
	  		-- cari ac sentral kamar hotel, tergantung luas-nya
	  		---------------------------------------------------------------------
	        vln_nilai_fasilitas := vln_nilai_fasilitas +
								   (vln_nilai_satuan * vln_luas_jpb7);
	  ELSIF vlc_status_fasilitas = '3'  THEN
	  		---------------------------------------------------------------------
	  		-- cari ac sentral non kamar hotel, tergantung luas-nya
	  		---------------------------------------------------------------------
	        vln_nilai_fasilitas := vln_nilai_fasilitas +
								   (vln_nilai_satuan * vln_luas_jpb7_lain);
	  ELSE vln_nilai_fasilitas := vln_nilai_fasilitas;
	  END IF;

  END LOOP;
  CLOSE cur_fasilitas;
  --dbms_output.put_line('vln_nilai_fasilitas = '||to_char(vln_nilai_fasilitas));
  ------------------------------------------------------------------
  -- nilai komponen utama + nilai biaya fasilitas
  ------------------------------------------------------------------
  vln_nilai_jpb7      := vln_nilai_dbkb_jpb7 + vln_nilai_fasilitas;
  --dbms_output.put_line('vln_nilai_jpb7 = '||to_char(vln_nilai_jpb7));
  ------------------------------------------------------------------
  -- nilai biaya fasilitas yang disusutkan
  ------------------------------------------------------------------
  vln_fasilitas_susut := FASILITAS_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vln_jml_lantai_bng, vlc_tahun, vln_fasilitas_susut);

  --dbms_output.put_line('vln_fasilitas_susut = '||to_char(vln_fasilitas_susut));
  ------------------------------------------------------------------
  -- cari nilai sebelum disusutkan
  ------------------------------------------------------------------
  vln_nilai_jpb7      := vln_nilai_jpb7 + coalesce(vln_fasilitas_susut,0);
  --dbms_output.put_line('vln_nilai_jpb7 = '||to_char(vln_nilai_jpb7));
  ------------------------------------------------------------------
  -- cari besar prosentase penyusutan
  ------------------------------------------------------------------
  vln_penyusutan     := SUSUT(vlc_tahun,
  					 	      vlc_thn_dibangun_bng,
							  vlc_thn_renovasi_bng,
                              vlc_kondisi_bng,
							  vln_nilai_jpb7,
							  vln_luas_bng,
							  0);

  vln_penyusutan     := ROUND((vln_penyusutan * vln_nilai_jpb7) / 100);
  --dbms_output.put_line('vln_penyusutan = '||to_char(vln_penyusutan));
  ------------------------------------------------------------------
  -- cari nilai setelah penyusutan
  ------------------------------------------------------------------
  vln_nilai_jpb7      := vln_nilai_jpb7 - vln_penyusutan;
  --dbms_output.put_line('vln_nilai_jpb7 = '||to_char(vln_nilai_jpb7));
  ------------------------------------------------------------------
  -- cari nilai fasilitas yang tidak disusutkan
  ------------------------------------------------------------------
  vln_fasilitas_tdk_susut := FASILITAS_TDK_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_fasilitas_tdk_susut);
  --dbms_output.put_line('vln_fasilitas_tdk_susut = '||to_char(vln_fasilitas_tdk_susut));
  ------------------------------------------------------------------
  -- cari nilai bangunan jpb 7
  ------------------------------------------------------------------
  vln_nilai_jpb7      := vln_nilai_jpb7 + vln_fasilitas_tdk_susut;
  --dbms_output.put_line('vln_nilai_jpb7 = '||to_char(vln_nilai_jpb7));
END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb8(IN vlc_kd_propinsi text, IN vlc_kd_dati2 text, IN vlc_kd_kecamatan text, IN vlc_kd_kelurahan text, IN vlc_kd_blok text, IN vlc_no_urut text, IN vlc_kd_jns_op text, IN vln_no_bng bigint, IN vlc_tahun text, INOUT vln_njop_jpb8 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


	vln_tinggi_kolom               dat_jpb8.ting_kolom_jpb8%type			:= 0;
	vln_lebar_bentang 			   dat_jpb8.lbr_bent_jpb8%type              := 0;
	vln_nilai_komponen_utama 	   decimal(17,2)				 		   		:= 0;
	vlc_atap 					   dat_op_bangunan.jns_atap_bng%type;
	vlc_lantai 					   dat_op_bangunan.kd_lantai%type;
	vlc_langit_langit 			   dat_op_bangunan.kd_langit_langit%type;
	vlc_dinding 				   dat_op_bangunan.kd_dinding%type;
	vln_jml_lantai_bng		   	   dat_op_bangunan.jml_lantai_bng%type 	    := 0;
	vln_nilai_atap 				   decimal(17,2)				 		   		:= 0;
	vln_nilai_lantai 			   decimal(17,2)				 		   		:= 0;
	vln_nilai_langit_langit 	   decimal(17,2)				 		   		:= 0;
	vln_nilai_material 			   decimal(17,2)				 		   		:= 0;
	vlc_type_konstruksi 		   dat_jpb8.type_konstruksi%type;
	vlc_cari_dinding 			   dbkb_material.kd_kegiatan%type;
	vln_nilai_dinding			   decimal(17,2)				 		   		:= 0;
	vln_nilai_daya_dukung 		   decimal(17,2)				 		   		:= 0;

	vln_nilai_fasilitas 		   decimal(17,2)				 		   		:= 0;
	vln_nilai_total_per_m2 		   decimal(17,2)				 		   		:= 0;
	vln_luas_bng 				   dat_op_bangunan.luas_bng%type 			:= 0;
	vln_nilai_total_kali_luas 	   decimal(17,2)				 		   		:= 0;
	vln_keliling_dinding 		   decimal(17,2)				 		   		:= 0;
	vln_total_nilai_dinding 	   decimal(17,2)				 		   		:= 0;
	vln_luas_mezzanine 			   dat_jpb8.luas_mezzanine_jpb8%type 		:= 0;
	vln_nilai_mezzanine 		   decimal(17,2)				 		   		:= 0;
	vln_nilai_total_mezzanine 	   decimal(17,2)				 		   		:= 0;
	vln_nilai_fasilitas_susut 	   decimal(17,2)				 		   		:= 0;
	vln_nilai_sebelum_susut 	   decimal(17,2)				 		   		:= 0;
	vlc_tahun_dibangun 			   dat_op_bangunan.thn_dibangun_bng%type;
	vlc_tahun_renovasi 			   dat_op_bangunan.thn_renovasi_bng%type;
	vln_umur_efektif 			   smallint 								:= 0;
	vln_biaya_pengganti_baru 	   decimal(17,2)				 		   		:= 0;
	vlc_kondisi_bng 			   dat_op_bangunan.kondisi_bng%type;
	vln_persentase_penyusutan 	   decimal(17,2)				 		   		:= 0;
	vln_nilai_setelah_susut 	   decimal(17,2)				 		   		:= 0;
	vln_nilai_fasilitas_tdk_susut  decimal(17,2)				 		   		:= 0;

/*---------------------------------
 DIBUAT OLEH : MADE
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 09-10-2000
*/
---------------------------------
BEGIN
	-------------------------------------------------------------------------------
	--- Menentukan biaya komponen utama / m2
	-------------------------------------------------------------------------------
    BEGIN
	  SELECT coalesce(ting_kolom_jpb8, 0),
	         coalesce(lbr_bent_jpb8,0),
			 coalesce(keliling_dinding_jpb8,0),
	  		 coalesce(luas_mezzanine_jpb8,0),
			 type_konstruksi
	  INTO STRICT   vln_tinggi_kolom,
	         vln_lebar_bentang,
			 vln_keliling_dinding,
	  		 vln_luas_mezzanine,
			 vlc_type_konstruksi
	  FROM   dat_jpb8
	  WHERE  kd_propinsi  = vlc_kd_propinsi
	    AND  kd_dati2     = vlc_kd_dati2
	  	AND  kd_kecamatan = vlc_kd_kecamatan
	  	AND  kd_kelurahan = vlc_kd_kelurahan
	  	AND  kd_blok 	  = vlc_kd_blok
	  	AND  no_urut 	  = vlc_no_urut
	  	AND  kd_jns_op 	  = vlc_kd_jns_op
	  	AND  no_bng 	  = vln_no_bng;

    EXCEPTION
  	  WHEN 	 OTHERS THEN
	  		 vln_tinggi_kolom	  := 0;
	         vln_lebar_bentang	  := 0;
			 vln_keliling_dinding := 0;
	  		 vln_luas_mezzanine	  := 0;
			 vlc_type_konstruksi  := null;
    END;

    ---------------------------------------------------------------------------------
    --- Cari Biaya Komponen Utama /m2
    ---------------------------------------------------------------------------------
	BEGIN
	  SELECT coalesce(nilai_dbkb_jpb8, 0)
	  INTO STRICT 	 vln_nilai_komponen_utama
	  FROM 	 dbkb_jpb8
	  WHERE  kd_propinsi               = vlc_kd_propinsi
	    AND  kd_dati2 				   = vlc_kd_dati2
	  	AND  thn_dbkb_jpb8 			   = vlc_tahun
	  	AND  lbr_bent_min_dbkb_jpb8   <= vln_lebar_bentang
	  	AND  lbr_bent_max_dbkb_jpb8   >= vln_lebar_bentang
	  	AND  ting_kolom_min_dbkb_jpb8 <= vln_tinggi_kolom
	  	AND  ting_kolom_max_dbkb_jpb8 >= vln_tinggi_kolom;

	EXCEPTION
	  WHEN OTHERS THEN vln_nilai_komponen_utama := 0;
  	END;

    ---------------------------------------------------------------------------------
    --- Menentukan Biaya Komponen Material /m2
    ---------------------------------------------------------------------------------
    BEGIN
	  SELECT jns_atap_bng,
	  		 kd_lantai,
			 kd_langit_langit,
			 coalesce(luas_bng, 0),
			 thn_dibangun_bng,
			 thn_renovasi_bng,
			 kondisi_bng,
			 kd_dinding,
			 jml_lantai_bng
	  INTO STRICT   vlc_atap,
	  		 vlc_lantai,
			 vlc_langit_langit,
			 vln_luas_bng,
	  		 vlc_tahun_dibangun,
			 vlc_tahun_renovasi,
			 vlc_kondisi_bng,
			 vlc_dinding,
			 vln_jml_lantai_bng
	  FROM   dat_op_bangunan
	  WHERE  kd_propinsi  = vlc_kd_propinsi
	    AND  kd_dati2     = vlc_kd_dati2
	  	AND  kd_kecamatan = vlc_kd_kecamatan
	  	AND  kd_kelurahan = vlc_kd_kelurahan
	  	AND  kd_blok 	  = vlc_kd_blok
	  	AND  no_urut 	  = vlc_no_urut
	  	AND  kd_jns_op 	  = vlc_kd_jns_op
	  	AND  no_bng 	  = vln_no_bng
	  	AND  kd_jpb 	  = '08';
    EXCEPTION
  	  WHEN   OTHERS THEN
	  		 vlc_atap	  		 := null;
	  		 vlc_lantai			 := null;
			 vlc_langit_langit	 := null;
			 vln_luas_bng		 := 0;
	  		 vlc_tahun_dibangun	 := null;
			 vlc_tahun_renovasi	 := null;
			 vlc_kondisi_bng	 := null;
			 vlc_dinding		 := null;
			 vln_jml_lantai_bng	 := 0;
    END;

    ---------------------------------------------------------------------------------
	--- Mencari Nilai Atap
    ---------------------------------------------------------------------------------
	BEGIN
	  SELECT coalesce(nilai_dbkb_material, 0)
	  INTO STRICT 	 vln_nilai_atap
	  FROM 	 dbkb_material
	  WHERE  kd_propinsi       = vlc_kd_propinsi
	    AND  kd_dati2 		   = vlc_kd_dati2
	  	AND  thn_dbkb_material = vlc_tahun
	  	AND  kd_pekerjaan 	   = '23'
	  	AND  kd_kegiatan 	   = '0'||vlc_atap;

  	EXCEPTION
  	  WHEN   OTHERS THEN vln_nilai_atap := 0;
  	END;

	vln_nilai_atap := vln_nilai_atap / coalesce(vln_jml_lantai_bng,1);
    ---------------------------------------------------------------------------------
	--- Mencari Nilai Lantai
    ---------------------------------------------------------------------------------
	BEGIN
	  SELECT coalesce(nilai_dbkb_material, 0)
	  INTO STRICT 	 vln_nilai_lantai
	  FROM 	 dbkb_material
	  WHERE  kd_propinsi       = vlc_kd_propinsi
	    AND  kd_dati2 		   = vlc_kd_dati2
	  	AND  thn_dbkb_material = vlc_tahun
	  	AND  kd_pekerjaan 	   = '22'
	  	AND  kd_kegiatan 	   = '0'||vlc_lantai;

  	EXCEPTION
  	  WHEN   OTHERS THEN vln_nilai_lantai := 0;
  	END;

    ---------------------------------------------------------------------------------
	--- Mencari Nilai Langit-langit
    ---------------------------------------------------------------------------------
	BEGIN
	  SELECT coalesce(nilai_dbkb_material, 0)
	  INTO STRICT 	 vln_nilai_langit_langit
	  FROM 	 dbkb_material
	  WHERE  kd_propinsi       = vlc_kd_propinsi
	  	AND  kd_dati2          = vlc_kd_dati2
	  	AND  thn_dbkb_material = vlc_tahun
	  	AND  kd_pekerjaan      = '24'
	  	AND  kd_kegiatan       = '0'||vlc_langit_langit;

  	EXCEPTION
  	  WHEN   OTHERS THEN vln_nilai_langit_langit := 0;
	END;

	vln_nilai_material := (vln_nilai_atap +
	                       vln_nilai_lantai +
						   vln_nilai_langit_langit);

    ---------------------------------------------------------------------------------
    --- Menentukan Daya Dukung Lantai
    ---------------------------------------------------------------------------------
 	BEGIN
	  SELECT coalesce(nilai_dbkb_daya_dukung, 0)
	  INTO STRICT   vln_nilai_daya_dukung
	  FROM 	 dbkb_daya_dukung
	  WHERE  kd_propinsi          = vlc_kd_propinsi
	    AND  kd_dati2             = vlc_kd_dati2
	  	AND  thn_dbkb_daya_dukung = vlc_tahun
	  	AND  type_konstruksi      = vlc_type_konstruksi;

    EXCEPTION
  	  WHEN OTHERS THEN vln_nilai_daya_dukung := 0;
    END;

    ---------------------------------------------------------------------------------
  	-- Menentukan Fasilitas / m2
  	---------------------------------------------------------------------------------
  	vln_nilai_fasilitas := 0;

  	vln_nilai_fasilitas := FASILITAS_SUSUT_X_LUAS(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, '08', NULL, vlc_tahun, vln_nilai_fasilitas);

    ---------------------------------------------------------------------------------
  	--- Nilai Total / m2
  	---------------------------------------------------------------------------------
  	vln_nilai_total_per_m2 := vln_nilai_komponen_utama +
          				      vln_nilai_material +
  							  vln_nilai_daya_dukung +
							  vln_nilai_fasilitas;

    ---------------------------------------------------------------------------------
  	--- Menghitung Nilai Total / m2 dikali luas
  	---------------------------------------------------------------------------------
  	vln_nilai_total_kali_luas := vln_nilai_total_per_m2 * vln_luas_bng;

  	---------------------------------------------------------------------------------
  	--- Menghitung Nilai dinding
  	--  Jenis dinding	   		  		    Jenis Kegiatan Dinding
  	--    1  >>  Kaca/Aluminium       	     01  >>  Kaca
  	--    2  >>  Beton						 02	 >>	 Aluminium / Spandek
  	--	  3  >>  Batu Bata/Conblok			 03	 >>	 Beton
  	--	  4  >>  Kayu 						 04	 >>  Batu Bata
  	--	  5  >>  Seng						 05	 >>	 Kayu
  	--	  6  >>  Tidak ada					 06  >>  Seng
  	---------------------------------------------------------------------------------
    --------------------------------------
    -- diubah teguh tanggal 26/10/2000
    --------------------------------------
    IF    vlc_dinding = '1' THEN vlc_cari_dinding := '09'; -- bukan '01';
    ELSIF vlc_dinding = '2' THEN vlc_cari_dinding := '02';
    ELSIF vlc_dinding = '3' THEN vlc_cari_dinding := '03';
    ELSIF vlc_dinding = '4' THEN vlc_cari_dinding := '07';
    ELSIF vlc_dinding = '5' THEN vlc_cari_dinding := '08';
    ELSIF vlc_dinding = '6' THEN vlc_cari_dinding := null;
    END IF;
    ---------------------------------------------------------------------------------
 	--- Mencari Nilai dinding
    ---------------------------------------------------------------------------------
	BEGIN
	  SELECT coalesce(nilai_dbkb_material, 0)
	  INTO STRICT   vln_nilai_dinding
	  FROM   dbkb_material
	  WHERE  kd_propinsi       = vlc_kd_propinsi
	    AND  kd_dati2          = vlc_kd_dati2
	    AND  thn_dbkb_material = vlc_tahun
	  	AND  kd_pekerjaan      = '21'
	  	AND  kd_kegiatan       = vlc_cari_dinding;

    EXCEPTION
  	  WHEN   OTHERS THEN vln_nilai_dinding := 0;
	END;

	vln_total_nilai_dinding := (vln_keliling_dinding *
	                            vln_tinggi_kolom *
	 						    (10/6) *
							    vln_nilai_dinding);

	---------------------------------------------------------------------------------
	--- Menghitung Nilai Mezzanine
	---------------------------------------------------------------------------------
	BEGIN
	  SELECT coalesce(nilai_dbkb_mezanin, 0)
	  INTO STRICT   vln_nilai_mezzanine
	  FROM   dbkb_mezanin
	  WHERE  kd_propinsi      = vlc_kd_propinsi
	    AND  kd_dati2         = vlc_kd_dati2
	    AND  thn_dbkb_mezanin = vlc_tahun;

    EXCEPTION
  	  WHEN   OTHERS THEN vln_nilai_mezzanine := 0;
	END;

	vln_nilai_total_mezzanine := vln_luas_mezzanine * vln_nilai_mezzanine;

	---------------------------------------------------------------------------------
	--- Menghitung Nilai Fasilitas yang disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_fasilitas_susut := 0;

	vln_nilai_fasilitas_susut := FASILITAS_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vln_jml_lantai_bng, vlc_tahun, vln_nilai_fasilitas_susut);

	---------------------------------------------------------------------------------
	--- Menghitung Nilai sebelum disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_sebelum_susut := vln_nilai_total_kali_luas +
	     					   vln_total_nilai_dinding +
							   vln_nilai_total_mezzanine +
							   vln_nilai_fasilitas_susut;

	---------------------------------------------------------------------------------
	--- Menhitung Penyusutan Bangunan
	---------------------------------------------------------------------------------
	vln_persentase_penyusutan := SUSUT(vlc_tahun,
	 						  	 	   vlc_tahun_dibangun,
 		 							   vlc_tahun_renovasi,
									   vlc_kondisi_bng,
									   vln_nilai_sebelum_susut,
									   vln_luas_bng,
									   0);

	---------------------------------------------------------------------------------
	--- Menghitung Nilai Setelah disusutkan
	---------------------------------------------------------------------------------
    IF (vln_persentase_penyusutan IS NOT NULL AND vln_persentase_penyusutan::text <> '') OR (vln_persentase_penyusutan = 0)  THEN
	   vln_persentase_penyusutan  := round((vln_persentase_penyusutan / 100)::numeric,2);
	   vln_nilai_setelah_susut    := vln_nilai_sebelum_susut -
		  				  	        (vln_nilai_sebelum_susut * vln_persentase_penyusutan);
    ELSE
	   vln_nilai_setelah_susut    := vln_nilai_sebelum_susut;
	END IF;

	---------------------------------------------------------------------------------
	--- Menghitung Fasilitas Lain yang tidak disusutkan
	---------------------------------------------------------------------------------
	vln_nilai_fasilitas_tdk_susut := 0;

	vln_nilai_fasilitas_tdk_susut := FASILITAS_TDK_SUSUT(vlc_kd_propinsi, vlc_kd_dati2, vlc_kd_kecamatan, vlc_kd_kelurahan, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_nilai_fasilitas_tdk_susut);

	---------------------------------------------------------------------------------
	--- Total NJOP JPB 8
	---------------------------------------------------------------------------------
	vln_njop_jpb8 := vln_nilai_setelah_susut + vln_nilai_fasilitas_tdk_susut;

END;
$procedure$
;
CREATE OR REPLACE PROCEDURE public.penilaian_jpb9(IN vlc_kd_prop character, IN vlc_kd_dati2 character, IN vlc_kd_kec character, IN vlc_kd_kel character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vln_no_bng smallint, IN vlc_tahun character, INOUT vln_nilai_jpb9 bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$
DECLARE


   vlc_kls_jpb9         dat_jpb9.kls_jpb9%type;
   vln_nilai_dbkb_jpb9	decimal(17,2)				 		   		:= 0;
   vlc_kd_jpb   		dat_op_bangunan.kd_jpb%type;

   vln_luas_bng   		dat_op_bangunan.luas_bng%type;
   vlc_kondisi_bng 		dat_op_bangunan.kondisi_bng%type;
   vln_jml_lantai_bng   dat_op_bangunan.jml_lantai_bng%type;
   vln_komp_utama 		decimal(17,2)				 		   		:= 0;
   vln_nilai_fas1 		decimal(17,2)				 		   		:= 0;
   vln_nilai_fas2 		decimal(17,2)				 		   		:= 0;
   vln_nilai_fas3 		decimal(17,2)				 		   		:= 0;
   vln_nilai1     		decimal(17,2)				 		   		:= 0;
   vln_nilai_sbl_susut  decimal(17,2)				 		   		:= 0;
   vln_nilai_stl_susut  decimal(17,2)				 		   		:= 0;
   vlc_thn_dibangun     dat_op_bangunan.thn_dibangun_bng%type;
   vlc_thn_renovasi     dat_op_bangunan.thn_renovasi_bng%type;
   vln_besar_susut      decimal(17,2)				 		   		:= 0;
   vln_persen_susut     decimal(17,2)				 		   		:= 0;

/*---------------------------------
 DIBUAT OLEH : SUNARYO
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH, RACHMAT
 TGL. REVISI : 09-10-2000
*/
---------------------------------
BEGIN
   SELECT kd_jpb,
   		  luas_bng,
	      thn_dibangun_bng,
          thn_renovasi_bng,
		  kondisi_bng,
		  jml_lantai_bng
   INTO STRICT   vlc_kd_jpb,
   		  vln_luas_bng,
		  vlc_thn_dibangun,
		  vlc_thn_renovasi,
   		  vlc_kondisi_bng,
		  vln_jml_lantai_bng
   FROM   dat_op_bangunan
   WHERE  kd_propinsi   = vlc_kd_prop    AND
	 	  kd_dati2 	    = vlc_kd_dati2   AND
	 	  kd_kecamatan  = vlc_kd_kec     AND
	 	  kd_kelurahan  = vlc_kd_kel     AND
	 	  kd_blok 	    = vlc_kd_blok    AND
	 	  no_urut 	    = vlc_no_urut    AND
	 	  kd_jns_op  	= vlc_kd_jns_op  AND
	 	  no_bng 		= vln_no_bng;

	 IF FOUND THEN
   	   BEGIN
      	  SELECT kls_jpb9
	  	  INTO STRICT   vlc_kls_jpb9
	  	  FROM   dat_jpb9
   	  	  WHERE  kd_propinsi   = vlc_kd_prop    AND
	 	  	 	 kd_dati2 	   = vlc_kd_dati2   AND
	 	  	 	 kd_kecamatan  = vlc_kd_kec     AND
	 	  	 	 kd_kelurahan  = vlc_kd_kel     AND
	 	  	 	 kd_blok 	   = vlc_kd_blok    AND
	 	  	 	 no_urut 	   = vlc_no_urut    AND
	 	  	 	 kd_jns_op     = vlc_kd_jns_op  AND
	 	  	 	 no_bng 	   = vln_no_bng;
   	   EXCEPTION
      	    WHEN   OTHERS THEN vlc_kls_jpb9 := null;
   	   END;

	   BEGIN
     	  SELECT nilai_dbkb_jpb9
     	  INTO STRICT   vln_nilai_dbkb_jpb9
     	  FROM   dbkb_jpb9
     	  WHERE  kd_propinsi      = vlc_kd_prop        AND
             	 kd_dati2         = vlc_kd_dati2 	   AND
            	 thn_dbkb_jpb9    = vlc_tahun 	  	   AND
            	 kls_dbkb_jpb9    = vlc_kls_jpb9       AND
            	 lantai_min_jpb9 <= vln_jml_lantai_bng AND
            	 lantai_max_jpb9 >= vln_jml_lantai_bng;
   	   EXCEPTION
          WHEN   OTHERS THEN vln_nilai_dbkb_jpb9 := 0;
   	   END;

   	   vln_komp_utama := vln_nilai_dbkb_jpb9;

	   vln_nilai_fas1 := FASILITAS_SUSUT_X_LUAS(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_kd_jpb, vlc_kls_jpb9, vlc_tahun, vln_nilai_fas1);

	   vln_nilai1 := (coalesce(vln_komp_utama,0) + coalesce(vln_nilai_fas1,0)) * coalesce(vln_luas_bng,0);

	   vln_nilai_fas2 := FASILITAS_SUSUT(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vln_jml_lantai_bng, vlc_tahun, vln_nilai_fas2);

	   vln_nilai_sbl_susut := coalesce(vln_nilai1,0) + coalesce(vln_nilai_fas2,0);

	   vln_besar_susut := SUSUT(vlc_tahun,
	                            vlc_thn_dibangun,
								vlc_thn_renovasi,
             			  		vlc_kondisi_bng,
								vln_nilai_sbl_susut,
								vln_luas_bng,
								0);

	   IF (vln_besar_susut IS NOT NULL AND vln_besar_susut::text <> '') OR (vln_besar_susut = 0) THEN
		  vln_persen_susut    := round((vln_besar_susut/100)::numeric, 2);
	      vln_nilai_stl_susut := (vln_nilai_sbl_susut -
		                         (vln_nilai_sbl_susut * vln_persen_susut));
	   ELSE
	      vln_nilai_stl_susut := vln_nilai_sbl_susut;
	   END IF;

       vln_nilai_fas3 := FASILITAS_TDK_SUSUT(vlc_kd_prop, vlc_kd_dati2, vlc_kd_kec, vlc_kd_kel, vlc_kd_blok, vlc_no_urut, vlc_kd_jns_op, vln_no_bng, vlc_tahun, vln_nilai_fas3);

	   vln_nilai_jpb9 := vln_nilai_stl_susut + coalesce(vln_nilai_fas3,0);
     ELSE
	   vln_nilai_jpb9 := 0;
	 END IF;

EXCEPTION
  WHEN no_data_found THEN vln_nilai_jpb9 := 0; --NULL;
END;
$procedure$
;
