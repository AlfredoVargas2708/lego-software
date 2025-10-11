export interface Lego {
    id: number;
    imagen_lego: string | null;
    lego: number;
    imagen_pieza: string | null;
    pieza: number;
    cantidad: number;
    set: string;
    task: number;
    esta_pedido: string;
    esta_completo: string;
    esta_reemplazado: string;
    comentarios: string;
}