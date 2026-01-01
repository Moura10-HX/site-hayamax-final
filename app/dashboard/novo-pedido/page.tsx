'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createOrder } from '../actions'

// --- TIPAGEM ---
type Produto = {
  id: string
  grupo: string
  nome: string
  desc: string
  icon: string
  tipo_tecnico: string
  preco: number
}

// --- DADOS DO CATÁLOGO ---
const CATALOGO: Record<string, Produto[]> = {
  surfacada: [
    { id: 'multi_hd', grupo: 'Multifocais Digitais', nome: 'Hayamax Multifocal HD', desc: 'Campo ampliado com tecnologia Freeform.', icon: '💎', tipo_tecnico: 'multifocal', preco: 250 },
    { id: 'multi_comfort', grupo: 'Multifocais Digitais', nome: 'Hayamax Comfort', desc: 'Adaptação suave para o dia a dia.', icon: '✨', tipo_tecnico: 'multifocal', preco: 180 },
    { id: 'vs_digital', grupo: 'Visão Simples', nome: 'VS Digital Surfaçada', desc: 'Alta precisão para miopias complexas.', icon: '🎯', tipo_tecnico: 'visao_simples', preco: 120 },
    { id: 'office_work', grupo: 'Ocupacionais', nome: 'Hayamax Office', desc: 'Foco em computador e leitura.', icon: '💼', tipo_tecnico: 'ocupacional', preco: 200 },
    { id: 'bifocal', grupo: 'Ocupacionais', nome: 'Bifocal Digital', desc: 'O clássico reinventado digitalmente.', icon: '👓', tipo_tecnico: 'bifocal', preco: 150 }
  ],
  pronta: [
    { id: 'vs_pronta_ar', grupo: 'Visão Simples (Estoque)', nome: 'VS Antirreflexo', desc: 'Entrega imediata 1.56.', icon: '📦', tipo_tecnico: 'visao_simples', preco: 50 },
    { id: 'vs_pronta_blue', grupo: 'Visão Simples (Estoque)', nome: 'VS Blue Cut', desc: 'Proteção contra luz azul.', icon: '🛡️', tipo_tecnico: 'visao_simples', preco: 70 },
    { id: 'vs_solar', grupo: 'Solar Graduado', nome: 'VS Solar Pronta', desc: 'Proteção UV400 Cinza/Marrom.', icon: '☀️', tipo_tecnico: 'visao_simples', preco: 90 }
  ]
}

const MATERIAIS = [
  { id: 'resina', nome: 'Resina 1.50', desc: 'Standard' },
  { id: 'policarbonato', nome: 'Policarbonato', desc: 'Resistente' },
  { id: 'trivex', nome: 'Trivex', desc: 'Premium' },
  { id: 'indice_167', nome: 'Alto Índice 1.67', desc: 'Fina' }
]

const TRATAMENTOS = [
  { id: 'sem_tratamento', nome: 'Sem Tratamento', custo: 0 },
  { id: 'antirreflexo', nome: 'Antirreflexo Premium', custo: 80 },
  { id: 'blue_cut', nome: 'Blue Cut', custo: 150 },
  { id: 'photosensivel', nome: 'Fotossensível', custo: 200 }
]

const formatMoney = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

function OrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const paramCategoria = searchParams.get('categoria')
  const categoria = (paramCategoria && CATALOGO[paramCategoria]) ? paramCategoria : 'surfacada'
  
  const produtosList = CATALOGO[categoria]
  const produtosAgrupados = produtosList.reduce((acc, prod) => {
    if (!acc[prod.grupo]) acc[prod.grupo] = []
    acc[prod.grupo].push(prod)
    return acc
  }, {} as Record<string, Produto[]>)
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selection, setSelection] = useState<{ produto: Produto | null, material: any, tratamento: any }>({ produto: null, material: null, tratamento: null })
  
  const [formData, setFormData] = useState({
    codigo_os: '', paciente_nome: '', cor: 'incolor',
    od_esferico: '', od_cilindrico: '', od_eixo: '', od_dnp: '', od_altura: '',
    oe_esferico: '', oe_cilindrico: '', oe_eixo: '', oe_dnp: '', oe_altura: '',
    adicao: ''
  })

  const selectProduct = (prod: Produto) => { setSelection({ ...selection, produto: prod }); setStep(2) }
  
  const selectOptions = (mat: any, trat: any) => { 
    if(!mat) return alert("Por favor, selecione um material.")
    setSelection({ ...selection, material: mat, tratamento: trat || TRATAMENTOS[0] })
    setStep(3) 
  }
  
  // Permite digitar livremente (incluindo negativo e ponto)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // --- REGRAS DE NEGÓCIO ÓPTICO (Ao sair do campo) ---
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (!value) return

    // Troca vírgula por ponto para cálculo
    let valorNumerico = parseFloat(value.replace(',', '.'))
    if (isNaN(valorNumerico)) return // Se não for número, ignora

    // REGRA 4: EIXO (0 a 180 inteiro)
    if (name.includes('eixo')) {
      if (valorNumerico < 0) valorNumerico = 0
      if (valorNumerico > 180) valorNumerico = 180
      setFormData(prev => ({ ...prev, [name]: Math.round(valorNumerico).toString() }))
      return
    }

    // REGRA 3: ESFÉRICO, CILÍNDRICO E ADIÇÃO (Múltiplos de 0.25)
    if (name.includes('esferico') || name.includes('cilindrico') || name.includes('adicao')) {
      // Arredonda para o 0.25 mais próximo
      valorNumerico = Math.round(valorNumerico * 4) / 4

      // REGRA 1: CILÍNDRICO SEMPRE NEGATIVO
      if (name.includes('cilindrico')) {
        valorNumerico = -Math.abs(valorNumerico) // Força negativo
      }

      // REGRA 2: ADIÇÃO SEMPRE POSITIVA
      if (name.includes('adicao')) {
        valorNumerico = Math.abs(valorNumerico) // Força positivo
        setFormData(prev => ({ ...prev, [name]: `+${valorNumerico.toFixed(2)}` })) // Adiciona o "+" visual
        return
      }

      // REGRA 5: FORMATAÇÃO (1 -> 1.00)
      setFormData(prev => ({ ...prev, [name]: valorNumerico.toFixed(2) }))
    }

    // Formatação visual para DNP e Altura
    if (name.includes('dnp') || name.includes('altura')) {
      setFormData(prev => ({ ...prev, [name]: valorNumerico.toFixed(1) }))
    }
  }

  // --- REGRA 6: ENTER PARA PRÓXIMO CAMPO ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Evita enviar o formulário
      const form = e.currentTarget.form
      if (!form) return
      
      const index = Array.prototype.indexOf.call(form, e.currentTarget)
      const nextElement = form.elements[index + 1] as HTMLElement
      
      if (nextElement) {
        nextElement.focus()
      }
    }
  }

  const handleSubmit = async () => {
    if (!formData.paciente_nome || !formData.codigo_os) return alert('Preencha a OS e o Nome do Cliente.')
    if (!selection.produto || !selection.material) return alert('Erro na seleção do produto.')

    setLoading(true)
    try {
      const dataToSend = new FormData()
      
      dataToSend.append('observacoes', `OS: ${formData.codigo_os} | Produto: ${selection.produto.nome} | Material: ${selection.material.nome}`)
      dataToSend.append('nome_paciente', formData.paciente_nome)
      dataToSend.append('tipo_lente', selection.produto.tipo_tecnico)
      dataToSend.append('tratamento', selection.tratamento?.nome || 'Sem tratamento')
      
      // Limpa os valores para envio (remove o "+" da adição se tiver, para salvar limpo ou mantém string se preferir)
      // Aqui enviamos como string formatada mesmo, o banco aceita numeric ou text dependendo da coluna.
      // Se sua coluna no banco for numeric, o Postgres aceita "-2.50" tranquilo.
      
      dataToSend.append('od_esferico', formData.od_esferico)
      dataToSend.append('od_cilindrico', formData.od_cilindrico)
      dataToSend.append('od_eixo', formData.od_eixo)
      dataToSend.append('od_dnp', formData.od_dnp)
      
      dataToSend.append('oe_esferico', formData.oe_esferico)
      dataToSend.append('oe_cilindrico', formData.oe_cilindrico)
      dataToSend.append('oe_eixo', formData.oe_eixo)
      dataToSend.append('oe_dnp', formData.oe_dnp)

      await createOrder(dataToSend)
    } catch (error) {
      console.error(error)
      alert('Erro ao criar pedido. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      
      {/* HEADER FIXO */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Link href="/dashboard" className="text-slate-400 hover:text-cyan-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              {step === 1 ? (categoria === 'surfacada' ? 'Catálogo Digital' : 'Estoque Pronta Entrega') : 'Novo Pedido'}
            </h1>
            <p className="text-xs text-slate-500 ml-7">
              {step === 1 ? 'Selecione o produto' : step === 2 ? 'Personalização' : 'Dados Técnicos'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${step >= i ? 'bg-cyan-600 scale-110' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">

        {/* --- PASSO 1: VITRINE --- */}
        {step === 1 && (
          <div className="animate-fade-in space-y-10">
            {Object.entries(produtosAgrupados).map(([grupo, produtos]) => (
              <div key={grupo}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{grupo}</h2>
                  <div className="h-px bg-slate-200 w-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {produtos.map((prod) => (
                    <button 
                      key={prod.id} 
                      onClick={() => selectProduct(prod)} 
                      className="group bg-white border border-slate-200 hover:border-cyan-500 rounded-xl p-6 text-left transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col h-full relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                          {prod.icon}
                        </div>
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded group-hover:bg-cyan-100 group-hover:text-cyan-700">
                          {formatMoney(prod.preco)}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-cyan-700 transition-colors">{prod.nome}</h3>
                      <p className="text-sm text-slate-500 mb-6 leading-relaxed flex-1">{prod.desc}</p>
                      <div className="w-full py-2.5 text-center text-sm font-bold text-cyan-600 border border-cyan-100 rounded-lg bg-cyan-50 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        Configurar Lente
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- PASSO 2: CONFIGURAÇÃO --- */}
        {step === 2 && selection.produto && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 flex items-center gap-6 shadow-sm">
              <div className="text-4xl p-4 bg-slate-50 rounded-lg">{selection.produto.icon}</div>
              <div>
                <h2 className="font-bold text-slate-800 text-2xl">{selection.produto.nome}</h2>
                <p className="text-slate-500">{selection.produto.desc}</p>
              </div>
              <button onClick={() => setStep(1)} className="ml-auto text-sm text-cyan-600 hover:text-cyan-700 font-bold hover:underline">
                Alterar Produto
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4 border-b pb-3 flex items-center gap-2">
                  <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> Material
                </h3>
                <div className="space-y-2">
                  {MATERIAIS.map(mat => (
                    <button key={mat.id} onClick={() => setSelection({...selection, material: mat})} className={`w-full p-3.5 rounded-lg border text-left flex justify-between items-center transition-all ${selection.material?.id === mat.id ? 'bg-cyan-50 border-cyan-500 text-cyan-700 font-bold shadow-sm ring-1 ring-cyan-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>
                      {mat.nome}
                      {selection.material?.id === mat.id && <span className="text-cyan-600">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4 border-b pb-3 flex items-center gap-2">
                  <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> Tratamento
                </h3>
                <div className="space-y-2">
                  {TRATAMENTOS.map(trat => (
                    <button key={trat.id} onClick={() => setSelection({...selection, tratamento: trat})} className={`w-full p-3.5 rounded-lg border text-left flex justify-between items-center transition-all ${selection.tratamento?.id === trat.id ? 'bg-cyan-50 border-cyan-500 text-cyan-700 font-bold shadow-sm ring-1 ring-cyan-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>
                      <span>{trat.nome}</span>
                      {trat.custo > 0 && <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-normal border border-slate-200">+ {formatMoney(trat.custo)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button onClick={() => selectOptions(selection.material, selection.tratamento)} disabled={!selection.material} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 px-12 rounded-lg shadow-lg shadow-cyan-600/20 disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-0.5">
                Avançar para Medidas →
              </button>
            </div>
          </div>
        )}

        {/* --- PASSO 3: DADOS TÉCNICOS --- */}
        {step === 3 && selection.produto && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              <form className="contents"> {/* Form wrapper para o Enter funcionar */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide border-b pb-2">Identificação</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase">Número da OS</label>
                      <input name="codigo_os" onChange={handleChange} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono" placeholder="Ex: 12345" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase">Nome do Cliente</label>
                      <input name="paciente_nome" onChange={handleChange} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Nome Completo" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide border-b pb-2">Grade de Dioptrias</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr>
                          <th className="p-2 text-xs font-bold text-slate-500 uppercase bg-slate-50 rounded-l-lg">Olho</th>
                          <th className="p-2 text-xs font-bold text-slate-500 uppercase bg-slate-50">Esférico</th>
                          <th className="p-2 text-xs font-bold text-slate-500 uppercase bg-slate-50">Cilíndrico</th>
                          <th className="p-2 text-xs font-bold text-slate-500 uppercase bg-slate-50">Eixo</th>
                          <th className="p-2 text-xs font-bold text-slate-500 uppercase bg-slate-50 border-l border-slate-200">DNP</th>
                          <th className="p-2 text-xs font-bold text-slate-500 uppercase bg-slate-50 rounded-r-lg">Altura</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-4 font-bold text-cyan-600">OD</td>
                          <td className="p-1"><input name="od_esferico" value={formData.od_esferico} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded p-2 text-center text-slate-800 focus:border-cyan-500 outline-none font-mono" placeholder="0.00" /></td>
                          <td className="p-1"><input name="od_cilindrico" value={formData.od_cilindrico} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded p-2 text-center text-slate-800 focus:border-cyan-500 outline-none font-mono" placeholder="0.00" /></td>
                          <td className="p-1"><input name="od_eixo" value={formData.od_eixo} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded p-2 text-center text-slate-800 focus:border-cyan-500 outline-none font-mono" placeholder="0" /></td>
                          <td className="p-1 border-l border-slate-100"><input name="od_dnp" value={formData.od_dnp} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded p-2 text-center text-slate-800 focus:border-cyan-500 outline-none" placeholder="mm" /></td>
                          <td className="p-1"><input name="od_altura" value={formData.od_altura} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded p-2 text-center text-slate-800 focus:border-cyan-500 outline-none" placeholder="mm" /></td>
                        </tr>
                        <tr>
                          <td className="py-4 font-bold text-slate-600">OE</td>
                          <td className="p-1"><input name="oe_esferico" value={formData.oe_esferico} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded p-2 text-center text-slate-800 focus:border-cyan-500 outline-none font-mono" placeholder="0.00" /></td>
                          <td className="p-1"><input name="oe_cilindrico" value={formData.oe_cilindrico} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded p-2 text-center text-slate-800 focus:border-cyan-500 outline-none font-mono" placeholder="0.00" /></td>
                          <td className="p-1"><input name="oe_eixo" value={formData.oe_eixo} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded p-2 text-center text-slate-800 focus:border-cyan-500 outline-none font-mono" placeholder="0" /></td>
                          <td className="p-1 border-l border-slate-100"><input name="oe_dnp" value={formData.oe_dnp} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded p-2 text-center text-slate-800 focus:border-cyan-500 outline-none" placeholder="mm" /></td>
                          <td className="p-1"><input name="oe_altura" value={formData.oe_altura} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded p-2 text-center text-slate-800 focus:border-cyan-500 outline-none" placeholder="mm" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-lg border border-slate-200">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Adição</span>
                      <input name="adicao" value={formData.adicao} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder="+0.00" className="w-24 bg-transparent text-center font-bold text-lg text-slate-800 outline-none font-mono" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Resumo Lateral */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
                <h2 className="font-bold text-slate-800 mb-4 text-lg border-b pb-3">Resumo do Pedido</h2>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-slate-500">Produto</span><span className="text-slate-800 font-bold text-right">{selection.produto.nome}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Material</span><span className="text-slate-800">{selection.material.nome}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tratamento</span><span className="text-slate-800">{selection.tratamento.nome}</span></div>
                </div>
                <div className="flex justify-between items-end mb-6 pt-4 border-t border-slate-100">
                  <span className="text-slate-500 font-bold">Total Estimado</span>
                  <span className="text-2xl font-bold text-cyan-600">{formatMoney(selection.produto.preco + (selection.tratamento?.custo || 0))}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={handleSubmit} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition-all">
                    {loading ? 'Enviando...' : 'Finalizar Pedido'}
                  </button>
                  <button onClick={() => setStep(1)} className="w-full py-2 text-slate-500 hover:text-slate-800 text-sm font-medium hover:underline">Voltar e editar</button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-medium">Carregando catálogo...</div>}>
      <OrderContent />
    </Suspense>
  )
}