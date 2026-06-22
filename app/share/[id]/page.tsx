import { getCardById, formatMonthYear } from "@/lib/cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCardIcon, Calendar, Receipt, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { PrintPdfButton } from "@/components/print-pdf-button";
import { buildRanking } from "@/lib/ranking";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await getCardById(id);
  return {
    title: card ? `Gestor de Cartões - ${card.nickname}` : "Gestor de Cartões",
  };
}

export default async function ShareCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await getCardById(id);

  if (!card) {
    notFound();
  }

  const ranking = buildRanking(card.expenses);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 print:bg-white">
      <div
        id="report"
        className="max-w-2xl mx-auto p-4 space-y-6 py-8 print:py-2"
      >
        {/* Botão PDF — escondido na impressão */}
        <div className="flex justify-end no-print">
          <PrintPdfButton />
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4 no-print">
            <div className="bg-primary text-primary-foreground p-4 rounded-full">
              <CreditCardIcon className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {card.nickname}
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <p>{formatMonthYear(card.month, card.year)}</p>
          </div>
        </div>

        {/* Total Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-xl print:shadow-none print:border print:text-black print:bg-white">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-blue-100 text-sm mb-2 print:text-gray-600">
              Total do Cartão
            </p>
            <p className="text-5xl font-bold">R$ {card.total.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* Quanto cada um vai pagar */}
        <Card className="shadow-lg print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Quanto cada um vai pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {card.cardUsers.length > 0 ? (
              <div className="space-y-3">
                {card.cardUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 print:bg-white"
                  >
                    <span className="font-semibold text-lg flex items-center gap-2">
                      {user.name}
                      {!user.inSplit && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                          fora da divisão
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-xl text-primary">
                      R$ {user.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhum pagante cadastrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ranking de Gastos */}
        {ranking.length > 0 && (
          <Card className="shadow-lg print:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Ranking de Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ranking.map((item, i) => (
                  <div
                    key={item.label + i}
                    className="flex items-center justify-between gap-3 p-3 bg-muted rounded-lg border border-border print:bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={
                          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold " +
                          (i === 0
                            ? "bg-amber-400 text-amber-950"
                            : i === 1
                              ? "bg-gray-300 text-gray-800"
                              : i === 2
                                ? "bg-orange-300 text-orange-950"
                                : "bg-muted-foreground/15 text-foreground")
                        }
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.count}{" "}
                          {item.count === 1 ? "lançamento" : "lançamentos"}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-primary whitespace-nowrap">
                      R$ {item.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg print:shadow-none">
          <CardHeader>
            <CardTitle>Detalhamento de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {card.expenses.length > 0 ? (
              <div className="space-y-3">
                {card.expenses.map((expense) => {
                  const isSplit = expense.users.length > 1;
                  return (
                  <div key={expense.id} className="p-4 bg-muted rounded-lg border border-border print:bg-white">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-lg">{expense.location}</p>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground">{expense.description}</p>
                        )}
                      </div>
                      <p className="font-bold text-xl text-primary whitespace-nowrap">R$ {expense.amount.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    {/* Quem pagou / se foi dividido */}
                    <div className="mt-3 pt-3 border-t border-border">
                      {expense.users.length === 0 ? (
                        <span className="text-xs font-medium text-muted-foreground">
                          Sem usuário atribuído
                        </span>
                      ) : isSplit ? (
                        <div className="space-y-1">
                          <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-indigo-700 bg-indigo-100 rounded px-1.5 py-0.5 print:bg-white">
                            Dividido entre {expense.users.length} usuários
                          </span>
                          <p className="mt-1 text-sm text-foreground">
                            {expense.users.map((u) => u.name).join(", ")}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5 print:bg-white">
                            Usuário
                          </span>
                          <span className="font-medium text-foreground">{expense.users[0].name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum gasto cadastrado</p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Relatório gerado pelo Gestor de Cartões</p>
        </div>
      </div>
    </div>
  );
}
