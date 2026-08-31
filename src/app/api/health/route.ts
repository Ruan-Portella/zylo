import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

import { db } from '@/db';

/// O ping que mantém o banco acordado.
///
/// ## Ele é seguro-morre-cedo, não urgente
///
/// A Vercel não dorme — função serverless não tem inatividade. E o Neon, que é o
/// banco daqui, **suspende o compute e religa sozinho** na próxima query: o
/// primeiro acesso depois da pausa paga alguns segundos a mais e funciona. Ou
/// seja, ao contrário de um projeto em Appwrite ou Supabase, este keep-alive é
/// cinto de segurança, não conserto de um problema conhecido.
///
/// Fica porque é barato — uma query por dia — e porque cobre a política que
/// mudar amanhã sem avisar.
///
/// ## E ele fala com o banco, senão não serve para nada
///
/// Uma rota que devolve `{ ok: true }` sem tocar em nada mantém acordado só o que
/// nunca dormiu. `select 1` é a query mais barata que ainda abre conexão.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  /// **A rota é aberta, então ela se protege pelo segredo do cron.**
  ///
  /// Uma rota pública que abre conexão com o banco a cada chamada é superfície de
  /// abuso barata. Se `CRON_SECRET` existir no ambiente, a Vercel manda
  /// `Authorization: Bearer <segredo>` em todo disparo, e aqui só passa quem tem
  /// ele. Sem a variável, a rota fica aberta — de propósito, para dar para testar
  /// no navegador antes de configurar.
  const segredo = process.env.CRON_SECRET;

  if (segredo && request.headers.get('authorization') !== `Bearer ${segredo}`) {
    return NextResponse.json({ ok: false, erro: 'não autorizado' }, { status: 401 });
  }

  try {
    await db.execute(sql`select 1`);

    return NextResponse.json({ ok: true, banco: 'acordado', at: new Date().toISOString() });
  } catch (erro) {
    /// **503, e não 200 com `ok: false`.** É o status que faz um monitor externo
    /// distinguir "acordei o banco" de "o banco está fora" — e é a única forma de
    /// o ping avisar quando ele para de funcionar. Um keep-alive que falha em
    /// silêncio é pior que nenhum, porque dá a sensação de estar coberto.
    return NextResponse.json(
      { ok: false, erro: erro instanceof Error ? erro.message : 'desconhecido' },
      { status: 503 }
    );
  }
}
