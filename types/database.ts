export type Profile = {
  id: string;
  razao_social: string;
  cnpj: string;
  telefone: string | null;
  limite_credito: number;
};

export type Order = {
  id: string;
  user_id: string;
  status: 'rascunho' | 'analise' | 'producao' | 'tratamento' | 'expedido' | 'entregue' | 'cancelado';
  codigo_rastreio: string | null;
  observacoes: string | null;
  created_at: string;
};