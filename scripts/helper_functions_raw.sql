CREATE OR REPLACE PROCEDURE public.fasilitas_susut(IN vlc_kd_propinsi character, IN vlc_kd_dati2 character, IN vlc_kd_kecamatan character, IN vlc_kd_kelurahan character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vln_no_bng smallint, IN vln_jml_lantai_bng smallint, IN vlc_tahun text, INOUT vln_nilai_fasilitas bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$;
DECLARE


  vln_jml_satuan       dat_fasilitas_bangunan.jml_satuan%type := 0;
  vlc_kd_fasilitas     fasilitas.kd_fasilitas%type;
  vlc_ketergantungan   fasilitas.ketergantungan%type;
  vln_nilai_satuan     fas_non_dep.nilai_non_dep%type := 0;

  -----------------------------------------------------------------------------------
  -- cursor untuk cari nilai satuan berdasarkan kode fasilitas yang ber-status '4' --
  -----------------------------------------------------------------------------------
  cur_biaya_fasilitas CURSOR FOR
     	 SELECT kd_fasilitas, ketergantungan
  		 FROM   fasilitas
  		 WHERE  status_fasilitas = '4';

/*---------------------------------
 DIBUAT OLEH : TEGUH
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH - RACHMAT
 TGL. REVISI : 05-10-2000
*/
---------------------------------
BEGIN
  vln_nilai_fasilitas := 0;
  OPEN cur_biaya_fasilitas;
  LOOP
	  FETCH cur_biaya_fasilitas INTO vlc_kd_fasilitas, vlc_ketergantungan;
	  EXIT WHEN NOT FOUND;/* apply on cur_biaya_fasilitas */

  	  -----------------------------------------------------------------------------------
	  -- seek jumlah satuan untuk masing2 kode fasilitas dari tabel DAT_FASILITAS_BANGUNAN --
  	  -----------------------------------------------------------------------------------
	  BEGIN
	  	   SELECT coalesce(jml_satuan, 0) INTO STRICT vln_jml_satuan
	  	   FROM   dat_fasilitas_bangunan
	  	   WHERE  kd_propinsi  = vlc_kd_propinsi  AND
		   		  		kd_dati2     = vlc_kd_dati2	  	AND
		 		  			kd_kecamatan = vlc_kd_kecamatan AND
		 		  			kd_kelurahan = vlc_kd_kelurahan AND
		 		  			kd_blok      = vlc_kd_blok      AND
		 		  			no_urut      = vlc_no_urut  	  AND
		 		  			kd_jns_op    = vlc_kd_jns_op    AND
		 		  			no_bng       = vln_no_bng       AND
		 		  			kd_fasilitas = vlc_kd_fasilitas;
	  EXCEPTION
	  	   WHEN no_data_found THEN vln_jml_satuan := 0;
	  END;

  	  -----------------------------------------------------------------------------------
	  -- seek nilai satuan untuk masing2 kode fasilitas --
  	  -----------------------------------------------------------------------------------
	  IF vlc_ketergantungan = '0' THEN
	  	 BEGIN
	     	  SELECT coalesce(nilai_non_dep, 0) INTO STRICT vln_nilai_satuan
	    	  FROM   fas_non_dep
	    	  WHERE  kd_propinsi  = vlc_kd_propinsi  AND
			   	  		 kd_dati2     = vlc_kd_dati2     AND
			   	  		 thn_non_dep  = vlc_tahun        AND
			   	  		 kd_fasilitas = vlc_kd_fasilitas;
	  	 EXCEPTION
	     	  WHEN no_data_found THEN vln_nilai_satuan := 0;
	     END;
	  ELSIF vlc_ketergantungan = '1' THEN
		  	BEGIN
				 IF vlc_kd_fasilitas IN ('30','31','32') THEN
			   	 	BEGIN
			   			 SELECT coalesce(nilai_dep_min_max, 0) INTO STRICT vln_nilai_satuan
		       			 FROM   fas_dep_min_max
		       			 WHERE  kd_propinsi     = vlc_kd_propinsi           AND
				   		  	   		kd_dati2        = vlc_kd_dati2              AND
				   		  	   		thn_dep_min_max = vlc_tahun                 AND
				   		  	   		kd_fasilitas    = vlc_kd_fasilitas          AND
				   		  	   		kls_dep_min    <= coalesce(vln_jml_lantai_bng,0) AND
				   		  	   		kls_dep_max    >= coalesce(vln_jml_lantai_bng,0);
		  	   		EXCEPTION
		       		  	 WHEN no_data_found THEN vln_nilai_satuan := 0;
			   		END;
				 ELSE
			   		 BEGIN
			   		 	  SELECT coalesce(nilai_dep_min_max, 0) INTO STRICT vln_nilai_satuan
	       			  FROM   fas_dep_min_max
	       			  WHERE  kd_propinsi     = vlc_kd_propinsi   AND
			   		  	  		 kd_dati2        = vlc_kd_dati2      AND
				   		  			 thn_dep_min_max = vlc_tahun         AND
				   		  			 kd_fasilitas    = vlc_kd_fasilitas  AND
				   		  			 kls_dep_min    <= vln_jml_satuan    AND
				   		  			 kls_dep_max    >= vln_jml_satuan;
	  	   		 EXCEPTION
	       		      WHEN no_data_found THEN vln_nilai_satuan := 0;
			   		 END;
				 END IF;
		  	END;
	  ELSE vln_nilai_satuan := 0;
	  END IF;

	  vln_nilai_fasilitas := vln_nilai_fasilitas + (vln_nilai_satuan * vln_jml_satuan);

  END LOOP;
  CLOSE cur_biaya_fasilitas;
END;
$procedure$;

CREATE OR REPLACE PROCEDURE public.fasilitas_susut_x_luas(IN vlc_kd_prop character, IN vlc_kd_dati2 character, IN vlc_kd_kec character, IN vlc_kd_kel character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vlc_no_bng smallint, IN vlc_kd_jpb character, IN vlc_kls_bintang character, IN vlc_tahun character, INOUT vln_fasilitas bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$;
DECLARE


   vlc_kd_fasilitas    dat_fasilitas_bangunan.kd_fasilitas%type;
   vln_jml_satuan      dat_fasilitas_bangunan.jml_satuan%type;
   vlc_kd_status       fasilitas.status_fasilitas%type;
   vlc_ketergantungan  fasilitas.ketergantungan%type;
   vln_nilai  		   fas_non_dep.nilai_non_dep%type;
   vln_nilai_fas   	   dat_op_bangunan.nilai_sistem_bng%type;

   c_fas1 CURSOR FOR
   		  SELECT a.kd_fasilitas     kd_fasilitas,
  		  		 a.jml_satuan 		jml_satuan,
  		 		 b.status_fasilitas status_fasilitas,
  		 		 b.ketergantungan 	ketergantungan
  		  from 	 dat_fasilitas_bangunan a,
  		  		 fasilitas b
  		  where  a.kd_propinsi   = vlc_kd_prop    AND
  		  		 a.kd_dati2 	 = vlc_kd_dati2   AND
 		 		 a.kd_kecamatan  = vlc_kd_kec  	  AND
 		 		 a.kd_kelurahan  = vlc_kd_kel  	  AND
 		 		 a.kd_blok 		 = vlc_kd_blok    AND
 		 		 a.no_urut 		 = vlc_no_urut    AND
 		 		 a.kd_jns_op  	 = vlc_kd_jns_op  AND
 		 		 a.no_bng 		 = vlc_no_bng  	  AND
 		 		 b.kd_fasilitas  = a.kd_fasilitas AND
 		 		 b.status_fasilitas  = '0';

/*---------------------------------
 DIBUAT OLEH : SUNARYO
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH - RACHMAT
 TGL. REVISI : 05-10-2000
*/
---------------------------------
BEGIN
   vln_nilai_fas := 0;
   FOR rec_c_fas1 in c_fas1 LOOP
       IF rec_c_fas1.ketergantungan = '0' THEN
       	  BEGIN
          	 SELECT nilai_non_dep
			 INTO STRICT 	vln_nilai
        	 FROM 	fas_non_dep
    		 WHERE  kd_propinsi  = vlc_kd_prop  AND
    		 	    kd_dati2 	 = vlc_kd_dati2 AND
     				thn_non_dep  = vlc_tahun    AND
    				kd_fasilitas = rec_c_fas1.kd_fasilitas;

			 vln_nilai_fas := vln_nilai_fas + (vln_nilai * rec_c_fas1.jml_satuan);
    	  EXCEPTION
      	  	 WHEN no_data_found THEN
      	   	 	  vln_nilai_fas := vln_nilai_fas;
    	  END;
       ELSIF rec_c_fas1.ketergantungan = '1' THEN
       	  BEGIN
    		 SELECT nilai_dep_min_max
			 INTO STRICT 	vln_nilai
  			 FROM 	fas_dep_min_max
  			 WHERE  kd_propinsi     = vlc_kd_prop  	   	      AND
   			 	    kd_dati2  	    = vlc_kd_dati2 		      AND
    				thn_dep_min_max = vlc_tahun       	      AND
   					kd_fasilitas    = rec_c_fas1.kd_fasilitas AND
          			kls_dep_min    <= rec_c_fas1.jml_satuan   AND
   					kls_dep_max    >= rec_c_fas1.jml_satuan;

		     vln_nilai_fas := vln_nilai_fas + (vln_nilai * rec_c_fas1.jml_satuan);
    	  EXCEPTION
       	   	 WHEN no_data_found THEN
       		 	  vln_nilai_fas := vln_nilai_fas;
    	  END;
       ELSIF rec_c_fas1.ketergantungan = '2' THEN
       	  BEGIN
    		 SELECT nilai_fasilitas_kls_bintang
			 INTO STRICT 	vln_nilai
  			 FROM 	fas_dep_jpb_kls_bintang
  			 WHERE  kd_propinsi             = vlc_kd_prop  	   	      AND
   			 	    kd_dati2  	            = vlc_kd_dati2 		      AND
    				thn_dep_jpb_kls_bintang = vlc_tahun       	      AND
   					kd_fasilitas            = rec_c_fas1.kd_fasilitas AND
          			kd_jpb                  = vlc_kd_jpb   			  AND
   					kls_bintang             = vlc_kls_bintang;

		     vln_nilai_fas := vln_nilai_fas + (vln_nilai * rec_c_fas1.jml_satuan);
    	  EXCEPTION
       	   	 WHEN no_data_found THEN
       		 	  vln_nilai_fas := vln_nilai_fas;
    	  END;
 	   END IF;
   END LOOP;

   vln_fasilitas := vln_nilai_fas;

END;
$procedure$;

CREATE OR REPLACE PROCEDURE public.fasilitas_tdk_susut(IN vlc_kd_propinsi character, IN vlc_kd_dati2 character, IN vlc_kd_kecamatan character, IN vlc_kd_kelurahan character, IN vlc_kd_blok character, IN vlc_no_urut character, IN vlc_kd_jns_op character, IN vln_no_bng smallint, IN vlc_tahun text, INOUT vln_nilai_fasilitas bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $procedure$;
DECLARE


  vln_jml_satuan       dat_fasilitas_bangunan.jml_satuan%type := 0;
  vlc_kd_fasilitas     fasilitas.kd_fasilitas%type;
  vlc_ketergantungan   fasilitas.ketergantungan%type;
  vln_nilai_satuan     fas_non_dep.nilai_non_dep%type := 0;

  -----------------------------------------------------------------------------------
  -- cursor untuk cari nilai satuan berdasarkan kode fasilitas yang ber-status '5' --
  -----------------------------------------------------------------------------------
  cur_fas_tdk_susut CURSOR FOR
    SELECT kd_fasilitas, ketergantungan
    FROM   fasilitas
    WHERE  status_fasilitas = '5';

/*---------------------------------
 DIBUAT OLEH : TEGUH
 TANGGAL     :
 REVISI KE   : 1
 DIREVISI    : TEGUH - RACHMAT
 TGL. REVISI : 05-10-2000
*/
---------------------------------
BEGIN
  vln_nilai_fasilitas := 0;

  OPEN cur_fas_tdk_susut;
  LOOP
 	   FETCH cur_fas_tdk_susut INTO vlc_kd_fasilitas, vlc_ketergantungan;
 	   EXIT WHEN NOT FOUND;/* apply on cur_fas_tdk_susut */

  	   -----------------------------------------------------------------------------------
 	   -- seek nilai satuan untuk masing2 kode fasilitas dari tabel FAS_NON_DEP --
  	   -----------------------------------------------------------------------------------
 	   BEGIN
   	   		SELECT coalesce(nilai_non_dep, 0) INTO STRICT vln_nilai_satuan
	   			FROM   fas_non_dep
	   			WHERE  kd_propinsi  = vlc_kd_propinsi  AND
		   				   kd_dati2     = vlc_kd_dati2     AND
		   				   thn_non_dep  = vlc_tahun        AND
		   				   kd_fasilitas = vlc_kd_fasilitas;
 	   EXCEPTION
	   			WHEN no_data_found THEN vln_nilai_satuan := 0;
 	   END;

  	   -----------------------------------------------------------------------------------
	   -- seek jumlah satuan untuk masing2 kode fasilitas dari tabel DAT_FASILITAS_BANGUNAN --
  	   -----------------------------------------------------------------------------------
 	   BEGIN
       		SELECT coalesce(jml_satuan, 0) INTO STRICT vln_jml_satuan
	   			FROM   dat_fasilitas_bangunan
	   			WHERE  kd_propinsi  = vlc_kd_propinsi  AND
		   				   kd_dati2     = vlc_kd_dati2  	 AND
		   				   kd_kecamatan = vlc_kd_kecamatan AND
		   				   kd_kelurahan = vlc_kd_kelurahan AND
		   				   kd_blok      = vlc_kd_blok      AND
		   				   no_urut      = vlc_no_urut    	 AND
		   				   kd_jns_op    = vlc_kd_jns_op    AND
		   				   no_bng       = vln_no_bng       AND
		   				   kd_fasilitas = vlc_kd_fasilitas;
 	   EXCEPTION
   			WHEN no_data_found THEN vln_jml_satuan := 0;
 	   END;

	   ---------------------------------------------------------------------------
	   -- jika kode fasilitas = '44' [listrik] maka biaya fasilitas listrik / 1000
	   ---------------------------------------------------------------------------
	   IF vlc_kd_fasilitas = '44' THEN
	   	  vln_nilai_fasilitas := vln_nilai_fasilitas + ((vln_nilai_satuan * vln_jml_satuan)/1000);
	   ELSE
	   	  vln_nilai_fasilitas := vln_nilai_fasilitas + (vln_nilai_satuan * vln_jml_satuan);
	   END IF;

  END LOOP;
  CLOSE cur_fas_tdk_susut;
END;
$procedure$;

CREATE OR REPLACE FUNCTION public.susut(vlc_tahun text, vlc_tahun_dibangun text, vlc_tahun_renovasi text, vlc_kondisi_bng text, vln_nilai bigint, vln_luas_bng bigint, vln_flag_standard bigint)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
 -- 1 = bangunan standart, 0 = non standart
DECLARE


	VLN_LUAS_BANGUNAN         bigint;
	vln_umur_efektif  	   	  smallint;
	vln_biaya_pengganti_baru  bigint;
	vln_persentase_susut 	  smallint;
	vln_tahun 				  smallint := coalesce((vlc_tahun)::numeric , 0);
	vln_tahun_dibangun 		  smallint := coalesce((vlc_tahun_dibangun)::numeric , 0);
	vln_tahun_renovasi 		  smallint := coalesce((vlc_tahun_renovasi)::numeric , 0);
	vlc_kd_range_penyusutan   range_penyusutan.kd_range_penyusutan%type;

/*-----------------------------
 DIBUAT OLEH : MADE
 TANGGAL     :
 REVISI KE   : 2
 DIREVISI    : TEGUH, RAHMAT, RUSLAN
 TGL. REVISI : 19-10-2000
*/
-----------------------------
BEGIN
  ------------------------------------------------------------
  --- mencari umur efektif
  ------------------------------------------------------------
  IF vln_flag_standard = 0 THEN
    ------------------------------------------------------------
    -- jika bangunan non standart
    ------------------------------------------------------------
	IF vln_tahun_dibangun > 0 THEN
  	   ------------------------------------------------------------
	   -- jika tahun dibangun ada
  	   ------------------------------------------------------------
	   IF vln_tahun_renovasi > 0 THEN
  	   	  ------------------------------------------------------------
		  -- jika tahun renovasi ada
  		  ------------------------------------------------------------
		  IF (vln_tahun - vln_tahun_renovasi) > 10 THEN
  		  	 ------------------------------------------------------------
			 -- (jika tahun pajak - tahun renovasi) > 10
  		  	 ------------------------------------------------------------
			 vln_umur_efektif := ROUND(((vln_tahun - vln_tahun_dibangun) +	(2*10)) / 3);
		  ELSE
  		  	 ------------------------------------------------------------
             -- (jika tahun pajak - tahun renovasi) <= 10
  		  	 ------------------------------------------------------------
			  vln_umur_efektif := ROUND(((vln_tahun - vln_tahun_dibangun) +
								  (2*(vln_tahun - vln_tahun_renovasi))) / 3);
		  END IF;
		ELSE
			------------------------------------------------------------
			-- tahun renovasi kosong
			------------------------------------------------------------
			IF (vln_tahun - vln_tahun_dibangun) > 10 THEN
			   vln_umur_efektif := ROUND(((vln_tahun - vln_tahun_dibangun) + (2*10)) / 3);
			ELSE
				vln_umur_efektif := vln_tahun - vln_tahun_dibangun;
			END IF;
		END IF;

	ELSE
       RETURN 0;
	END IF;
  ELSE
    ------------------------------------------------------------
    -- jika bangunan standart
    ------------------------------------------------------------
    IF vln_tahun_renovasi > 0 THEN
	   vln_umur_efektif := vln_tahun - vln_tahun_renovasi;
	ELSE
	   vln_umur_efektif := vln_tahun - vln_tahun_dibangun;
	END IF;
  END IF;

	IF vln_umur_efektif > 40 THEN
	   vln_umur_efektif := 40;
	END IF;

    ------------------------------------------------------------
	--- mencari biaya pengganti baru / m2
    ------------------------------------------------------------
	IF vln_luas_bng = 0 THEN
	   VLN_LUAS_BANGUNAN := 1;
	ELSE
	   VLN_LUAS_BANGUNAN := vln_luas_bng;
	END IF;

	vln_biaya_pengganti_baru := (coalesce(vln_nilai,0) * 1000) / VLN_LUAS_BANGUNAN;

    ------------------------------------------------------------
	--- mencari kode range penyusutan
    ------------------------------------------------------------
	BEGIN
		SELECT kd_range_penyusutan
		INTO STRICT   vlc_kd_range_penyusutan
		FROM   range_penyusutan
		WHERE  nilai_min_penyusutan <  vln_biaya_pengganti_baru AND
			   nilai_max_penyusutan >= vln_biaya_pengganti_baru;
	EXCEPTION
		WHEN OTHERS THEN RETURN 0;
	END;

    ------------------------------------------------------------
	--- mencari prosentase penyusutan
    ------------------------------------------------------------
	BEGIN
	 SELECT coalesce(nilai_penyusutan, 0)
	 INTO STRICT 	vln_persentase_susut
	 FROM 	penyusutan
	 WHERE  umur_efektif        = vln_umur_efektif        AND
	   	    kd_range_penyusutan = vlc_kd_range_penyusutan AND
	   	    kondisi_bng_susut   = vlc_kondisi_bng;
	EXCEPTION
		WHEN OTHERS THEN RETURN 0;
	END;

	RETURN vln_persentase_susut;
END;
$function$

