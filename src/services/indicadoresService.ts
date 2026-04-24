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
            map.get(node.idJefe)!.children!.push(node);
        } else {
            // Es raíz o huérfano
            if (node.idCargo === 1) { // Admin es raíz real
                roots.push(node);
            } else {
                orphans.push(node);
            }
        }
    });

    // Si no hay admins, los primeros de la lista son raíces (fallback)
    if (roots.length === 0 && orphans.length > 0) {
        roots.push(orphans.shift()!);
    }

    // Normalizar niveles de Huérfanos
    // Queremos que los Guardas estén en el nivel 2, Supervisores en el nivel 1
    if (roots.length > 0) {
        const mainRoot = roots[0];

        // Agrupar huérfanos por cargo
        const orphanSupervisors = orphans.filter(o => o.idCargo === 4);
        const orphanGuards = orphans.filter(o => o.idCargo !== 4 && o.idCargo !== 1);

        // Los supervisores huérfanos van directo al admin (nivel 1)
        if (orphanSupervisors.length > 0) {
            mainRoot.children!.push(...orphanSupervisors);
        }

        // Los guardas huérfanos necesitan un nodo fantasma en el nivel 1
        if (orphanGuards.length > 0) {
            const ghostSupervisor: PersonalNode = {
                id: -999, // ID negativo para fantasma
                nombre: 'OTROS COLABORADORES',
                cargo: 'PERSONAL SIN ASIGNACIÓN DIRECTA',
                genero: '',
                idJefe: mainRoot.id,
                activo: 'SI',
                esFantasma: true,
                children: orphanGuards
            };
            mainRoot.children!.push(ghostSupervisor);
        }
    } else if (orphans.length > 0) {
        // Fallback total si no hay estructura
        roots.push(...orphans.slice(0, 50));
    }

    return roots;
}
