DELIMITER //

DROP PROCEDURE IF EXISTS SembrarGuardasCorregido //

CREATE PROCEDURE SembrarGuardasCorregido()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_sede, v_zona, v_h, v_m INT;
    DECLARE ps_list VARCHAR(255);
    DECLARE i INT;
    DECLARE v_puesto_id INT;
    DECLARE guarda_num INT DEFAULT 1;
    DECLARE img_url VARCHAR(500) DEFAULT 'https://fortoxsecurity.com/wp-content/uploads/2024/01/descubre-tu-futuro-laboral.jpg';
    
    -- Tabla para definir la distribución exacta segun imagen e IDs reales
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_dist (
        sd INT, zn INT, h INT, m INT, ps_list VARCHAR(255)
    );

    INSERT INTO temp_dist VALUES 
    -- BOGOTÁ (Zona 1)
    (3, 1, 8, 5, '123,128,150,154,3'),
    (2, 1, 5, 1, '2,999'),
    (7, 1, 3, 0, '165'),
    (6, 1, 3, 0, '135'),
    (1, 1, 2, 1, '1'),
    (5, 1, 10, 3, '38,40,5,39,997'),
    (4, 1, 6, 3, '4,996,995'),
    -- COSTA (Zona 3)
    (17, 3, 3, 3, '138,140'),
    (38, 3, 2, 0, '125'),
    -- ANTIOQUIA (Zona 2)
    (32, 2, 8, 5, '36,37,46,52,50'),
    (12, 2, 6, 0, '12,994'),
    (13, 2, 3, 3, '130,145'),
    -- PACÍFICO (Zona 4)
    (21, 4, 1, 2, '22'),
    (26, 4, 1, 2, '153'),
    (22, 4, 2, 0, '122');

    BEGIN
        DECLARE cur CURSOR FOR SELECT * FROM temp_dist;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
        
        SET FOREIGN_KEY_CHECKS = 0;
        OPEN cur;
        
        read_loop: LOOP
            FETCH cur INTO v_sede, v_zona, v_h, v_m, ps_list;
            IF done THEN LEAVE read_loop; END IF;
            
            -- Insertar Hombres
            SET i = 1;
            WHILE i <= v_h DO
                -- Seleccionar puesto rotativo de la lista
                SET v_puesto_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ps_list, ',', (i % (LENGTH(ps_list) - LENGTH(REPLACE(ps_list, ',', '')) + 1)) + 1), ',', -1) AS UNSIGNED);
                
                INSERT INTO PSC_PERSONAL (CP_IDCARGO_FK, SE_IDSEDE_FK, PU_IDPUESTO_FK, CI_IDCIUDAD_FK, PR_NOMBRE, PR_CARGO_LARGO, PR_GENERO, PR_FOTO_URL)
                VALUES (2, v_sede, v_puesto_id, v_zona, CONCAT('Guarda ', guarda_num), 'GUARDA DE SEGURIDAD', 'HOMBRE', img_url);
                
                SET i = i + 1; SET guarda_num = guarda_num + 1;
            END WHILE;
            
            -- Insertar Mujeres
            SET i = 1;
            WHILE i <= v_m DO
                SET v_puesto_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ps_list, ',', (i % (LENGTH(ps_list) - LENGTH(REPLACE(ps_list, ',', '')) + 1)) + 1), ',', -1) AS UNSIGNED);
                
                INSERT INTO PSC_PERSONAL (CP_IDCARGO_FK, SE_IDSEDE_FK, PU_IDPUESTO_FK, CI_IDCIUDAD_FK, PR_NOMBRE, PR_CARGO_LARGO, PR_GENERO, PR_FOTO_URL)
                VALUES (2, v_sede, v_puesto_id, v_zona, CONCAT('Guarda ', guarda_num), 'GUARDA DE SEGURIDAD', 'MUJER', img_url);
                
                SET i = i + 1; SET guarda_num = guarda_num + 1;
            END WHILE;
        END LOOP;
        
        CLOSE cur;
        SET FOREIGN_KEY_CHECKS = 1;
    END;
    DROP TEMPORARY TABLE temp_dist;
END //

DELIMITER ;

-- Ejecutar
CALL SembrarGuardasCorregido();
DROP PROCEDURE SembrarGuardasCorregido;
