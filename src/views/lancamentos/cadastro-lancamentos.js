import React from 'react'

import Card from '../../components/card'
import FormGroup from '../../components/form-group'
import SelectMenu from '../../components/selectMenu'

import LancamentoService from '../../app/service/lancamentoService'

import { withRouter } from 'react-router-dom'

import * as messages from '../../components/toastr'
import LocalStorageService from '../../app/service/localstorageService'

class CadastroLancamentos extends React.Component {

    state = {
        id: null,
        descricao: '',
        valor: '',
        mes: '',
        ano: '',
        tipo: '',
        status: '',
        usuaario: null,
        atualizando: false   
     }

    constructor() {
        super();
        this.service = new LancamentoService();
    }

    componentDidMount() {
        const params = this.props.match.params
        if (params.id) {
            this.service.obterPorId(params.id)
            .then(response => {
                this.setState({...response.data, atualizando: true})
            })
            .catch( error => {
                messages.mensagemErro(error.response.data)
            })
        }

    }

    submit = () => {

        const usuarioLogado = LocalStorageService.obterItem('_usuario_logado')

        const { descricao, valor, mes, ano, tipo} = this.state;

        //const lancamento = { descricao, valor, mes, ano, tipo, usuario: usuarioLogado.id}
        const lancamento = { descricao, valor, mes, ano, tipo, usuario:1}
        try {
            this.service.validar(lancamento)
        } catch(erro) {
            const mensagens = erro.mensagens;
            mensagens.forEach(msg => messages.mensagemErro(msg));
            return false;
        }

        this.service.salvar(lancamento)
            .then(response => {
                this.props.history.push('/consulta-lancamentos')
                messages.mensagemSucesso('Lançamento cadastrado com sucesso!')
            }).catch(error => {
                messages.mensagemErro(error.response.data)
            })
    }

    atualizar = () => {
        const { descricao, valor, mes, ano, tipo, id, usuario} = this.state;
        const lancamento = { descricao, valor, mes, ano, tipo, id, usuario}

        this.service.atualizar(lancamento)
            .then(response => {
                this.props.history.push('/consulta-lancamentos')
                messages.mensagemSucesso('Lançamento atualizado com sucesso!')
            }).catch(error => {
                messages.mensagemErro(error.response.data)
            })
    }

    handleChange = (event) => {
        const value = event.target.value;
        const name = event.target.name;

        this.setState({[name]: value})
    }

    render() {

        const tipos =  this.service.obterListaTipos();
        const meses = this.service.obterListaMeses();

        return (
            <Card title={this.atualizando ? 'Atualização de Lancamento' : 'Cadastro de Lancamento'}>
                <div className="row">
                    <div className="col-md-12">
                        <FormGroup id="inputDescricao" label="Descrição: *">
                            <input id="inputDescricao" type="text" 
                                className="form-control" 
                                name="descricao"
                                value={this.state.descricao}
                                onChange={this.handleChange} />
                        </FormGroup>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <FormGroup id="inputAno" label="Ano: *">
                            <input id="inputAno" type="text" 
                                className="form-control"
                                name="ano"
                                value={this.state.ano}
                                onChange={this.handleChange} />
                        </FormGroup>
                    </div>
                    <div className="col-md-6">
                        <FormGroup id="inputMes" label="Mês: *">
                            <SelectMenu 
                                className="form-control" id="inputMes" 
                                lista={meses}
                                name="mes"
                                value={this.state.mes}
                                onChange={this.handleChange}/>
                        </FormGroup>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <FormGroup id="inputValor" label="Valor: *">
                            <input id="inputValor" type="text" 
                                className="form-control"
                                name="valor"
                                value={this.state.valor}
                                onChange={this.handleChange} />
                        </FormGroup>
                    </div>
                    <div className="col-md-4">
                        <FormGroup id="inputTipo" label="Tipo: *">
                            <SelectMenu 
                                className="form-control" id="inputTipo" 
                                lista={tipos} 
                                name="tipo"
                                value={this.state.tipo}
                                onChange={this.handleChange}/> 
                        </FormGroup>
                    </div>
                    <div className="col-md-4">
                        <FormGroup id="inputStatus" label="Status: *">
                            <input id="inputStatus" type="text" 
                            className="form-control" 
                            name="status"
                            value={this.state.status}
                            disabled />
                        </FormGroup>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        {this.state.atualizando ?
                            (
                                <button onClick={this.atualizar} 
                                    type="button" className="btn btn-success">
                                    <i className="pi pi-refresh" />Atualizar</button>
                            ) : (
                                <button onClick={this.submit} 
                                    type="button" 
                                    className="btn btn-success">
                                     <i className="pi pi-save" />Salvar</button>
                            )
                        }
                        <button onClick={e => this.props.history.push('/consulta-lancamentos')} type="button" 
                            className="btn btn-danger">
                             <i className="pi pi-times" /> Cancelar</button>
                    </div>
                </div>
            </Card>
        )
    }
}

export default withRouter(CadastroLancamentos);