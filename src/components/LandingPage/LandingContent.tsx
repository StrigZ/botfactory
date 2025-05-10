'use client';

import Image from 'next/image';

import { useLandingPageContext } from '~/context/LandingPageContext';

type Props = {
  observerRef: (node?: Element | null) => void;
};

export default function LandingContent({ observerRef }: Props) {
  const {
    refs: { hero, how, trust, why },
  } = useLandingPageContext();

  return (
    <main className="flex h-screen snap-y snap-mandatory flex-col overflow-x-hidden overflow-y-scroll font-mono text-white">
      {/* Hero */}
      <section
        className="landing__section-outer relative from-purple-500 to-purple-800"
        ref={hero}
      >
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
        <div className="absolute bottom-0" ref={observerRef} />
      </section>
      {/* Hero */}
      {/* Why */}
      <section
        id="why-us"
        className="landing__section-outer bg-zinc-900"
        ref={why}
      >
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
                неограниченно + Webhook, CRM, аналитику и приоритетную поддержку
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
      {/* How */}
      <section
        ref={how}
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
      {/* Trust */}
      <section
        id="trust-us"
        className="landing__section-outer bg-zinc-900"
        ref={trust}
      >
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
  );
}
