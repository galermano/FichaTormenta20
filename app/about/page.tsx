export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-extrabold text-white">Sobre o T20 Sheet</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
        <p>
          O <strong className="text-amber-400">T20 Sheet</strong> é um gerenciador de fichas de personagem para o RPG{' '}
          <strong>Tormenta20</strong>. Totalmente gratuito, sem login e funciona offline.
        </p>
        <p>
          Todos os dados são salvos localmente no seu navegador (localStorage). Nenhuma informação é enviada para servidores externos.
        </p>
        <h2 className="pt-4 text-lg font-bold text-white">Funcionalidades</h2>
        <ul className="list-inside list-disc space-y-1 text-slate-400">
          <li>Criar, editar, duplicar e excluir fichas</li>
          <li>Busca e filtros por nível</li>
          <li>Exportar e importar fichas em JSON</li>
          <li>Cálculos automáticos (modificadores, defesa, perícias, CD de magias)</li>
          <li>Autosave automático</li>
          <li>Layout responsivo para mobile e desktop</li>
        </ul>
        <h2 className="pt-4 text-lg font-bold text-white">Tormenta20</h2>
        <p>
          Tormenta20 é um RPG de mesa brasileiro publicado pela Jambô Editora. Este site é uma ferramenta de fã e não possui afiliação oficial.
        </p>
      </div>
    </div>
  );
}
