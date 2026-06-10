import type { Metadata } from "next"
import { Shield, Zap, Users, Award } from "lucide-react"

export const metadata: Metadata = { title: "About Us" }

const values = [
  { icon: Zap, title: "Продуктивність насамперед", desc: "Ми відбираємо лише найшвидше та найнадійніше обладнання для вимогливих користувачів." },
  { icon: Shield, title: "Гарантія якості", desc: "Кожен товар перевірений та постачається з гарантією 2 роки." },
  { icon: Users, title: "Спільнота на першому місці", desc: "Створено геймерами та професіоналами для геймерів та професіоналів." },
  { icon: Award, title: "Підтримка експертів", desc: "Наша команда фахівців з обладнання доступна 24/7 для допомоги." },
]

const team = [
  { name: "Олег Вінніков", role: "Студент ІТ-23-3", image: "/team/oleh-vinnikov.jpg" },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-secondary/20 py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-semibold tracking-tight mb-6">
            Про RTW-RTP
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Наша місія — зробити преміальну комп'ютерну техніку доступною для всіх — чи то для виконання дедлайнів, чи для домінування у таблицях лідерів.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight mb-6">Наша історія</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              RTW-RTP було засновано у 2026 році групою ентузіастів, яким набридло орієнтуватися в переповнених каталогах товарів із нестабільною якістю. Ми поставили за мету створити кураторський маркетплейс, де кожен товар заслуговує на своє місце.
            </p>
            <p>
              <strong className="text-foreground">Готовий до роботи, Готовий до гри</strong> — це не просто наш слоган, це наша філософія. Найкраще обладнання не повинно змушувати вибирати між продуктивністю та потужністю. Ми вважаємо, що можна мати і те, і інше.
            </p>
            <p>
              Сьогодні RTW-RTP обслуговує понад 50 000 клієнтів по всьому світу — від indie-розробників до кіберспортивних професіоналів — усі вони знаходять саме те спорядження, яке їм потрібне для успіху.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-center mb-12">Наші цінності</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-card rounded-2xl border border-border p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-4">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-center mb-12">Наша команда</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden bg-muted mb-4 border-2 border-border">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
