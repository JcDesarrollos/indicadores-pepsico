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
    const hasAnyJefe = nodes.some(n => n.idJefe !== null);

    if (hasAnyJefe) {
        nodes.forEach(node => {
            if (node.idJefe !== null && map.has(node.idJefe)) {
                map.get(node.idJefe)!.children!.push(node);
            } else {
                // Si no tiene jefe o su jefe no está en la lista activa, es raíz
                roots.push(node);
            }
        });
    }

    // Si después de procesar jerarquía real no hay raíces (error en datos) 
    // o no hay jerarquía definida, usamos el fallback por cargos
    if (roots.length === 0) {
        const admins = nodes.filter(n => n.idCargo === 1);
        const supervisors = nodes.filter(n => n.idCargo === 4);
        const others = nodes.filter(n => n.idCargo !== 1 && n.idCargo !== 4);

        if (admins.length > 0) {
            admins.forEach(admin => {
                admin.children = [...supervisors];
                roots.push(admin);
            });
            if (supervisors.length > 0) {
                supervisors.forEach((sup, idx) => {
                    if (idx === 0) sup.children = others.slice(0, 80);
                });
            }
        } else if (supervisors.length > 0) {
            supervisors.forEach(sup => {
                sup.children = others.slice(0, 80);
                roots.push(sup);
            });
        } else {
            roots.push(...nodes.slice(0, 100));
        }
    }

    return roots;
}
