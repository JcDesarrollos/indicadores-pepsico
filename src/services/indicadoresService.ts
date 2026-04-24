import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export interface PersonalNode {
    id: number;
    nombre: string;
    cargo: string;
    genero: string;
    idJefe: number | null;
    idCargo?: number;
    idSede?: number | null;
    idPuesto?: number | null;
    idCiudad?: number | null;
    activo: string;
    foto?: string;
    esFantasma?: boolean;
    children?: PersonalNode[];
}

export async function getOrganigramaData(): Promise<PersonalNode[]> {
    const [rows] = await db.query<RowDataPacket[]>(`
        SELECT 
            PR_IDPERSONAL_PK as id,
            PR_NOMBRE as nombre,
            PR_CARGO_LARGO as cargo,
            PR_GENERO as genero,
            PR_IDJEFE_FK as idJefe,
            CP_IDCARGO_FK as idCargo,
            SE_IDSEDE_FK as idSede,
            PU_IDPUESTO_FK as idPuesto,
            CI_IDCIUDAD_FK as idCiudad,
            PR_ACTIVO as activo,
            PR_FOTO_URL as foto
        FROM PSC_PERSONAL
        WHERE PR_ACTIVO = 'SI'
    `);
    const nodes = rows as (PersonalNode & { idCargo: number })[];
    if (nodes.length === 0) return [];

    const map = new Map<number, PersonalNode>();
    nodes.forEach(node => {
        node.children = [];
        map.set(node.id, node);
    });

    const roots: PersonalNode[] = [];
    const orphans: PersonalNode[] = [];

    nodes.forEach(node => {
        if (node.idJefe !== null && map.has(node.idJefe)) {
            const jefe = map.get(node.idJefe)!;

            // Si un Guarda depende de un Supervisor, insertamos Operador Fantasma para bajar nivel
            if (node.idCargo === 2 && jefe.idCargo === 4) {
                let ghostOp = jefe.children?.find(c => c.esFantasma && c.idCargo === 3);
                if (!ghostOp) {
                    ghostOp = {
                        id: -777 - jefe.id,
                        nombre: 'OPERADORES DE MEDIOS',
                        cargo: 'MEDIOS Y MONITOREO',
                        genero: '',
                        idJefe: jefe.id,
                        activo: 'SI',
                        idCargo: 3,
                        esFantasma: true,
                        children: []
                    };
                    jefe.children!.push(ghostOp);
                }
                ghostOp.children!.push(node);
            } else {
                jefe.children!.push(node);
            }
        } else {
            if (node.idCargo === 1) {
                roots.push(node);
            } else {
                orphans.push(node);
            }
        }
    });

    // Limitar hijos Guardas a 10 en todo el mapa para evitar saturación
    map.forEach(node => {
        if (node.children && node.children.length > 10) {
            const guards = node.children.filter(c => c.idCargo === 2);
            const nonGuards = node.children.filter(c => c.idCargo !== 2);
            if (guards.length > 10) {
                node.children = [...nonGuards, ...guards.slice(0, 10)];
            }
        }
    });

    if (roots.length === 0 && orphans.length > 0) {
        roots.push(orphans.shift()!);
    }

    // Normalizar huérfanos respetando la cadena de mando (Pirámide de Niveles)
    if (roots.length > 0) {
        const mainRoot = roots[0];
        const orphanSupervisors = orphans.filter(o => o.idCargo === 4);
        const orphanOperators = orphans.filter(o => o.idCargo === 3);
        const orphanGuards = orphans.filter(o => o.idCargo === 2);

        // 1. Supervisores huérfanos -> Nivel 1 (Bajo Admin)
        if (orphanSupervisors.length > 0) mainRoot.children!.push(...orphanSupervisors);

        // 2. Operadores huérfanos -> Nivel 2 (vía Supervisor Fantasma)
        if (orphanOperators.length > 0) {
            const ghostSup: PersonalNode = {
                id: -999, nombre: 'SUPERVISIÓN OPERATIVA', cargo: 'PERSONAL SIN ASIGNACIÓN', genero: '',
                idJefe: mainRoot.id, activo: 'SI', idCargo: 4, esFantasma: true, children: orphanOperators
            };
            mainRoot.children!.push(ghostSup);
        }

        // 3. Guardas huérfanos -> Nivel 3 (vía Sup Fantasma -> Op Fantasma)
        if (orphanGuards.length > 0) {
            const limitedOrphanGuards = orphanGuards.slice(0, 10);
            const ghostSupForGuards: PersonalNode = {
                id: -998, nombre: 'SUPERVISIÓN OPERATIVA', cargo: 'PERSONAL SIN ASIGNACIÓN', genero: '',
                idJefe: mainRoot.id, activo: 'SI', idCargo: 4, esFantasma: true, children: []
            };
            const ghostOpForGuards: PersonalNode = {
                id: -888, nombre: 'MEDIOS Y MONITOREO', cargo: 'OPERADORES GHOST', genero: '',
                idJefe: -998, activo: 'SI', idCargo: 3, esFantasma: true, children: limitedOrphanGuards
            };
            ghostSupForGuards.children!.push(ghostOpForGuards);
            mainRoot.children!.push(ghostSupForGuards);
        }
    }

    return roots;
}
