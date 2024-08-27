import { Usuario } from "../types/Usuario";

export const UsuarioService = {
    verificarExistenciaOCrearUsuario: async (usuario: Usuario): Promise<string> => {
        try {
            const query = `SELECT * FROM usuario WHERE usuario = :usuario`;

            const params = { usuario: usuario.usuario };

            const resultSelect: any = await window.electronAPI.selectDatabase(query, params);

            if (resultSelect.rows.length > 0) {
                return 'Usuario existente';
            } else {
                const queryInsert = `INSERT INTO usuario (usuario, contraseña, rol) VALUES (:usuario, :contraseña, :rol)`;

                const params: any = { usuario: usuario.usuario, contraseña: usuario.contraseña, rol: usuario.rol };

                await window.electronAPI.insertDatabase(queryInsert, params, '');
                return 'Usuario creado con éxito';
            }
        } catch (e) {
            console.error(e);
            return 'Ha ocurrido un error al acceder al usuario en la base de datos';
        }
    },
}