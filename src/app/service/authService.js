import LocalStorageService from './localstorageService'

export const USUARIO_LOGADO = '_usuario_logado'

export default class AuthService {

    static isUsuarioAutenticado () {
        const usuario = LocalStorageService.obterItem(USUARIO_LOGADO)
        console.log(usuario && usuario.id);
        return usuario && usuario.id;
    }

    static removerUsuarioAutenticado () {
        LocalStorageService.removerItem(USUARIO_LOGADO)
    }

    logar (usuario) {
        LocalStorageService.adicionarItem(USUARIO_LOGADO, usuario)
    }

    obterUsuarioAutenticado () {
        return LocalStorageService.obterItem(USUARIO_LOGADO);
    }
}