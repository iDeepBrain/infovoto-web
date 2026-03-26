export const metadata = {
  title: "Términos y Condiciones — Voti",
};

export default function TermsPage() {
  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Términos y Condiciones de Uso</h1>
        <p className="text-sm text-gray-500">Última actualización: marzo 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1. ¿Qué es Voti?</h2>
        <p className="text-sm leading-relaxed">
          Voti es un asistente de información electoral que utiliza inteligencia artificial para
          ayudarte a consultar información sobre candidatos, partidos y propuestas de las
          elecciones generales de Perú 2026. La información proviene de fuentes públicas
          oficiales como el Jurado Nacional de Elecciones (JNE) y la Oficina Nacional de
          Procesos Electorales (ONPE).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2. Sobre la información que brinda Voti</h2>
        <p className="text-sm leading-relaxed">
          Voti genera respuestas usando inteligencia artificial. Si bien nos esforzamos por
          ofrecer información precisa y actualizada, las respuestas pueden contener errores o
          estar desactualizadas. Siempre verifica la información en las fuentes oficiales
          (jne.gob.pe, onpe.gob.pe).
        </p>
        <p className="text-sm leading-relaxed">
          Voti <strong className="text-white">NO</strong> emite opiniones,{" "}
          <strong className="text-white">NO</strong> recomienda candidatos y{" "}
          <strong className="text-white">NO</strong> tiene afiliación con ningún partido
          político ni entidad gubernamental.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">3. Uso del servicio</h2>
        <p className="text-sm leading-relaxed">Al usar Voti, te comprometes a:</p>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 pl-2">
          <li>Utilizar el servicio con fines informativos y educativos</li>
          <li>No intentar manipular o engañar al sistema</li>
          <li>No usar la información para desinformar a otros</li>
          <li>Respetar las leyes electorales peruanas vigentes</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">4. Limitación de responsabilidad</h2>
        <p className="text-sm leading-relaxed">
          Voti se ofrece &quot;tal cual&quot;, sin garantías de disponibilidad, exactitud o
          completitud. No nos hacemos responsables por decisiones tomadas basándose
          únicamente en las respuestas de Voti. Este servicio es gratuito y puede modificarse
          o suspenderse sin previo aviso.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">5. Propiedad intelectual</h2>
        <p className="text-sm leading-relaxed">
          El código, diseño y la marca Voti pertenecen al equipo de Voti. La información
          electoral es de dominio público.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">6. Modificaciones</h2>
        <p className="text-sm leading-relaxed">
          Podemos actualizar estos términos en cualquier momento. La fecha de última
          actualización se muestra al inicio de esta página. El uso continuado del servicio
          implica la aceptación de los términos actualizados.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">7. Ley aplicable</h2>
        <p className="text-sm leading-relaxed">
          Estos términos se rigen por las leyes de la República del Perú. Cualquier
          controversia se resolverá ante los tribunales competentes de Lima.
        </p>
      </section>
    </article>
  );
}
