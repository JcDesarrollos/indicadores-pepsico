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

    // Normalizar huérfanos integrándolos en la pirámide principal
    if (roots.length > 0) {
        const mainRoot = roots[0];
        const orphanSupervisors = orphans.filter(o => o.idCargo === 4);
        const orphanOperators = orphans.filter(o => o.idCargo === 3);
        const orphanGuards = orphans.filter(o => o.idCargo === 2);

        // 1. Supervisores huérfanos -> Siempre bajo Admin
        if (orphanSupervisors.length > 0) mainRoot.children!.push(...orphanSupervisors);

        // 2. Operadores huérfanos -> Intentar colgar de un Supervisor Real
        const anySupervisor = mainRoot.children?.find(c => c.idCargo === 4) || orphanSupervisors[0];
        if (orphanOperators.length > 0) {
            if (anySupervisor) {
                anySupervisor.children!.push(...orphanOperators);
            } else {
                // Si no hay ningún supervisor, colgarlos del admin como L1
                mainRoot.children!.push(...orphanOperators);
            }
        }

        // 3. Guardas huérfanos -> Intentar colgar de un Operador Real
        // Buscamos un operador en cualquier parte del nivel 2
        let anyOperator: PersonalNode | undefined;
        if (anySupervisor) {
            anyOperator = anySupervisor.children?.find(c => c.idCargo === 3);
        }

        const limitedOrphanGuards = orphanGuards.slice(0, 10);
        if (limitedOrphanGuards.length > 0) {
            if (anyOperator) {
                anyOperator.children!.push(...limitedOrphanGuards);
            } else if (anySupervisor) {
                // Si hay supervisor pero no operador, creamos el "Operador Fantasma" bajo ese supervisor
                const ghostOp: PersonalNode = {
                    id: -888, nombre: 'MEDIOS Y MONITOREO', cargo: 'OPERADOR GHOST', genero: '',
                    idJefe: anySupervisor.id, activo: 'SI', idCargo: 3, esFantasma: true, children: limitedOrphanGuards
                };
                anySupervisor.children!.push(ghostOp);
            } else {
                // Último recurso: bajo el admin
                mainRoot.children!.push(...limitedOrphanGuards);
            }
        }
    }

    return roots;
}
