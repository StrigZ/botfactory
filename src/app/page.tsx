import Image from 'next/image';
import Link from 'next/link';

import Header from '~/components/LandingPage/Header/Header';
import { LatestPost } from '~/components/post';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { auth } from '~/server/auth';
import { HydrateClient, api } from '~/trpc/server';

export default async function Landing() {
  const hello = await api.post.hello({ text: 'from tRPC' });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <Header />
      <main className="flex h-screen snap-y snap-mandatory flex-col overflow-x-hidden overflow-y-scroll font-mono text-white">
        {/* Hero */}
        <section className="landing__section-outer from-purple-500 to-purple-800">
          <article className="landing__section-inner">
            <h1>Создавайте мощные Telegram-боты без кода за минуты</h1>
            <p className="text-white/75">
              Бесплатный конструктор с drag-n-drop, расширенные фичи по подписке
            </p>
            <div className="relative h-[500px] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/hero-image.jpg"
                alt=""
                fill
                className="object-cover object-center"
              />
            </div>
          </article>
        </section>
        {/* Hero */}
        <Separator />
        {/* Why */}
        <section id="why-us" className="landing__section-outer bg-zinc-900">
          <article className="landing__section-inner">
            <h2>Почему именно мы</h2>
            <ul>
              <li>
                <p>Интуитивный редактор</p>
                <p>
                  Добавляйте триггеры, кнопки и интеграции одним перетаскиванием
                </p>
              </li>
              <li>
                <p>Мгновенный хостинг</p>
                <p>Ваш бот в сети сразу после сохранения настроек</p>
              </li>
              <li>
                <p>Гибкая подписка</p>
                <p>
                  Бесплатно: до 3 ботов и 10 000 сообщений в месяц Pro:
                  неограниченно + Webhook, CRM, аналитику и приоритетную
                  поддержку
                </p>
              </li>
              <li>
                <p>Полная документация</p>
                <p>Шаг-за-шаг инструкции и примеры готовых сценариев</p>
              </li>
            </ul>
          </article>
        </section>
        {/* Why */}
        <Separator />
        {/* How */}
        <section
          id="how-it-works"
          className="landing__section-outer bg-gray-200 text-zinc-900"
        >
          <article className="landing__section-inner">
            <h2>Как это работает</h2>
            <ol>
              <li>Зарегистрируйтесь через Telegram</li>
              <li>Создайте нового бота в личном кабинете</li>
              <li>Настройте логику – echo, кнопки, условия и внешние API</li>
              <li>Запустите и делитесь ссылкой на вашего помощника</li>
            </ol>
          </article>
        </section>
        {/* How */}
        <Separator />
        {/* Trust */}
        <section id="trust-us" className="landing__section-outer bg-zinc-900">
          <article className="landing__section-inner">
            <h2>Доверьтесь профессионалам</h2>
            <p>
              Запускайте проекты быстро, без разработчиков и сложных настроек –
              начните уже сегодня!
            </p>
          </article>
        </section>
        {/* Trust */}
      </main>
    </HydrateClient>
  );
}
