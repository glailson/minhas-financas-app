import React from 'react'
import { withRouter } from 'react-router-dom'
import Card from '../../components/card'
import FormGroup from '../../components/form-group'
import SelectMenu from '../../components/selectMenu'
import LancamentosTable from './lancamentosTable'

import LancamentoService from '../../app/service/lancamentoService'
import LocalStorageService from '../../app/service/localstorageService'

import * as messages from '../../components/toastr'
import { error } from 'toastr'
import {Dialog} from 'primereact/dialog'

import { Button } from 'primereact/button';
import Axios from 'axios'
import {mensagemErro} from '../../components/toastr'

class ConsultaLancamentos extends React.Component {

    state = {
        ano: '',
        mes: '',
        tipo: '',
        descricao: '',
        showConfirmDialog: false,
        lancamentoDeletar: {},
        lancamentos: []
    }

    constructor() {
        super()
        this.service = new LancamentoService();
    } 

    entrar = () => {
        Axios.post('http://localhost:8080/api/usuarios/autenticar',{
            email: this.state.email, 
            senha: this.state.senha
            
        }).then(response => {
            LocalStorageService.adicionarItem('_usuario_logado', response.data )
            this.props.history.push('/home')
        }).catch(erro => {
           mensagemErro(erro.response.data)
        })
    }

    buscar = () => {
       if (!this.state.ano) {
           messages.mensagemErro('O preenchimento do campo ano é obrigatório.')
           return false;
       }

       const usuarioLogado = LocalStorageService.obterItem('_usuario_logado')

       const lancamentoFiltro = {
           ano : this.state.ano,
           mes : this.state.mes,
           tipo : this.state.tipo,
           usuario : this.usuario
       }

       this.service.consultar(lancamentoFiltro)
       .then(resposta => {
           const lista = resposta.data;
           if (lista.length < 1) {
               messages.mensagemAlerta("Nenhum resultado encontrado.");
           }
           this.setState({lancamentos: lista})
       }).catch( error => {
           console.log(error)
       })
    }

    editar = (id) => {
        this.props.history.push(`/cadastro-lancamentos/${id}`)
    }

    abrirConfirmacao = (lancamento) => {
        this.setState({ showConfirmDialog : true, lancamentoDeletar: lancamento})
    }

    cancelarDelecao = () => {
        this.setState({ showConfirmDialog : false, lancamentoDeletar: {}})  
    }

    deletar = () => {
        this.service
            .deletar(this.state.lancamentoDeletar.id)
            .then(Response => {
                const lancamentos = this.state.lancamentos;
                const index = lancamentos.indexOf(this.lancamentoDeletar);
                lancamentos.splice(index, 1);
                this.setState({lancamentos: lancamentos, showConfirmDialog: false});
                messages.mensagemSucesso('Lançamento deletado com sucesso!')
            }).catch(error => {
                messages.mensagemErro('Ocorreu um erro ao tentar deletar um Lançamento.')
            } )
    }

    preparaFormularioCadastro = () => {
        this.props.history.push('/cadastro-lancamentos')
    }

    alterarStatus = (lancamento, status) => {
        this.service.alterarStatus(lancamento.id, status)
        .then( response => {
            const lancamentos  = this.state.lancamentos;
            const index = lancamentos.indexOf(lancamento);
            if (index !== -1) {
                lancamento['status'] = status;
                lancamentos[index] = lancamento
                this.setState({lancamento});
            }
            messages.mensagemSucesso("Status atualizado com sucesso!")
        })
    }
   
    render() {
        const meses = this.service.obterListaMeses();
        const tipos = this.service.obterListaTipos();

        const confirmDialogFooter = (    
            <div>
                <Button label="Confirmar" icon="pi pi-check" onClick={ this.deletar} />
                <Button label="Cancelar" icon="pi pi-times" onClick={this.cancelarDelecao} className="p-button-secondary"/>
            </div>
        )

        return (
            <Card title="Consulta Lançamentos">
                <div className="row">
                    <div className="col-md-6">
                        <div className="bd-component">
                            <FormGroup htmlFor="inputAno" label="Ano: ">
                                <input type="text" 
                                    id="inputAno" 
                                    className="form-control" 
                                    value={this.state.ano}
                                    onChange={e => this.setState({ano: e.target.value})}
                                    placeholder="Digite o Ano" />
                            </FormGroup>
                            <FormGroup htmlFor="inputMes" label="Mês:">
                                <SelectMenu id="inputMes" 
                                value={this.state.mes}
                                onChange={e => this.setState({mes: e.target.value})}
                                className="form-control" lista={meses} />
                            </FormGroup>

                            <FormGroup htmlFor="inputDescricao" label="Descrição: ">
                                <input type="text" 
                                    id="inputDescricao" 
                                    className="form-control" 
                                    value={this.state.descricao}
                                    onChange={e => this.setState({descricao: e.target.value})}
                                    placeholder="Digite a Descrição" />
                            </FormGroup>

                            <FormGroup htmlFor="inputTipo" label="Tipo Lançamento:">
                                <SelectMenu id="inputTipo"
                                value={this.state.tipo}
                                onChange={e => this.setState({tipo: e.target.value})} 
                                className="form-control" lista={tipos} />
                            </FormGroup>

                            <button onClick={this.buscar} 
                                type="button" className="btn btn-success">
                                <i className="pi pi-search" />   Buscar</button>
                            <button onClick={this.preparaFormularioCadastro} 
                                type="button" className="btn btn-danger">
                                <i className="pi pi-plus" />Cadastrar</button>
                        </div>
                    </div>
                </div>
                < br/>
                <div className="row">
                    <div className="col-md-12">
                        <div className="bs-component">
                            <LancamentosTable lancamentos={this.state.lancamentos}
                                deleteAction={this.abrirConfirmacao}
                                editAction={this.editar}
                                alterarStatus={this.alterarStatus} />
                        </div>
                    </div>
                </div>
                <div>   
                    <Dialog header="Confirmar Exclusão" 
                        visible={this.state.showConfirmDialog} 
                        style={{width: '50vw'}} 
                        modal={true} 
                        footer={confirmDialogFooter}
                        onHide={() => 
                        this.setState({visible: false})}>
                        Confima a exclusão deste Lançamento?
                    </Dialog>
                </div>
            </Card>
        )
    }
}

export default withRouter(ConsultaLancamentos);