export const metadata = {
  title: "Política de Privacidad — Voti",
};

export default function PrivacyPage() {
  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-500">Última actualización: marzo 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1. ¿Quién es responsable de tus datos?</h2>
        <p className="text-sm leading-relaxed">
          El equipo de Voti es responsable del tratamiento de tus datos personales en este
          servicio.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2. ¿Qué datos recopilamos?</h2>
        <p className="text-sm leading-relaxed">
          Cuando inicias sesión con Google, recibimos tu nombre, email y foto de perfil de tu
          cuenta de Google. Sin embargo, <strong className="text-white">NO almacenamos esta
          información directamente</strong>. Lo que guardamos:
        </p>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 pl-2">
          <li>Un identificador anónimo (hash criptográfico irreversible de tu cuenta de Google)</li>
          <li>Un hash de tu email (SHA-256, no se puede revertir a tu email original)</li>
          <li>Tu ciudad y país (obtenidos de forma aproximada, para estadísticas de uso)</li>
          <li>Tus consultas a Voti (para mejorar la calidad de las respuestas)</li>
        </ul>
        <p className="text-sm leading-relaxed text-gray-400 italic">
          En resumen: no podemos saber quién eres a partir de lo que guardamos.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">3. ¿Para qué usamos tus datos?</h2>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 pl-2">
          <li>Permitir que inicies sesión de forma segura</li>
          <li>Mejorar la calidad de las respuestas de Voti</li>
          <li>Generar estadísticas anónimas de uso y comportamiento (ej: consultas por día, distribución geográfica)</li>
        </ul>
        <p className="text-sm leading-relaxed mt-2">
          <strong className="text-white">No</strong> usamos tus datos para publicidad,
          marketing ni los vendemos a terceros.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">4. ¿Con quién compartimos tus datos?</h2>
        <p className="text-sm leading-relaxed">
          No compartimos tus datos personales con terceros. Los servicios técnicos que usamos:
        </p>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 pl-2">
          <li>Google OAuth (para la autenticación — sujeto a la política de privacidad de Google)</li>
          <li>Google Analytics (estadísticas anónimas de uso del sitio)</li>
          <li>Servidores en Google Cloud Platform (infraestructura)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">5. ¿Cómo protegemos tus datos?</h2>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 pl-2">
          <li>Los identificadores se almacenan como hashes criptográficos irreversibles (SHA-256)</li>
          <li>Las comunicaciones están cifradas con HTTPS/TLS</li>
          <li>El acceso a los servidores está restringido mediante autenticación y permisos</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">6. Tus derechos (Ley 29733)</h2>
        <p className="text-sm leading-relaxed">
          Según la Ley N.° 29733, Ley de Protección de Datos Personales del Perú, tienes
          derecho a:
        </p>
        <ul className="text-sm leading-relaxed space-y-2 pl-2">
          <li>
            <strong className="text-white">Acceso:</strong> Solicitar qué datos tenemos sobre ti
          </li>
          <li>
            <strong className="text-white">Rectificación:</strong> Corregir datos inexactos
          </li>
          <li>
            <strong className="text-white">Cancelación:</strong> Solicitar la eliminación de tus datos
          </li>
          <li>
            <strong className="text-white">Oposición:</strong> Oponerte al tratamiento de tus datos
          </li>
        </ul>
        <p className="text-sm leading-relaxed mt-2">
          Para ejercer estos derechos, contáctanos a través de los canales disponibles en la
          sección de contacto de nuestro sitio.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">7. Cookies y almacenamiento local</h2>
        <p className="text-sm leading-relaxed">
          Usamos cookies técnicas necesarias para la autenticación (NextAuth.js) y
          almacenamiento local del navegador para recordar tu preferencia de consentimiento.
          No usamos cookies de seguimiento ni publicidad.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">8. Cambios a esta política</h2>
        <p className="text-sm leading-relaxed">
          Podemos actualizar esta política en cualquier momento. La fecha de última
          actualización se muestra al inicio de esta página.
        </p>
      </section>
    </article>
  );
}
