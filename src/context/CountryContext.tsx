"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { COUNTRIES_195, CountryItem } from "@/data/countries195";

// Dictionary of translations across top global languages
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.caseStudies": "Case Studies",
    "nav.roiEstimator": "ROI Estimator",
    "nav.aboutUs": "About Us",
    "nav.contactUs": "Contact Us",
    "nav.consultation": "Free Consultation",
    "hero.badge": "INDIA'S 1ST 'TEACH + COMPLETE' PROJECT PLATFORM",
    "hero.titleRealWork": "Real Work.",
    "hero.titleRealLearning": "Real Learning.",
    "hero.titleRealGrowth": "Real Growth.",
    "hero.subtitle": "Empowering students, startups, and enterprises with end-to-end execution. We bridge the gap between learning and doing through rapid MVPs, full-stack software development, AI solutions, and specialized research support.",
    "hero.ctaFree": "Schedule Free Consultation",
    "hero.ctaRoi": "Calculate Project ROI",
    "hero.profitable": "Bootstrapped & Profitable",
    "hero.verified": "100% Turnitin Verified Quality",
    "hero.rating": "4.8/5 Rating (150+ Reviews)",
    "services.heading": "Our Core Execution Capabilities",
    "services.subheading": "From high-converting web apps to AI models and academic research papers, we deliver production-grade work with complete knowledge transfer.",
    "projects.heading": "Proven Client Case Studies",
    "projects.subheading": "Real problems, verifiable metrics, and battle-tested solutions delivered across India and worldwide.",
    "projects.challenge": "THE CHALLENGE",
    "projects.readCaseStudy": "Read Full Case Study",
    "roi.heading": "Interactive ROI & Project Estimator",
    "roi.subheading": "Calculate your investment, expected delivery timeline, and projected return on investment.",
    "team.heading": "Core Leadership & Domain Leads",
    "team.subheading": "The dedicated team executing operations, engineering, marketing, and client partnerships.",
    "contact.heading": "Ready to Transform Your Idea?",
    "contact.subheading": "Schedule a 30-minute discovery call with our technical leads or request an instant project estimate.",
    "modal.title": "Select Your Country (195 Countries Supported)",
    "modal.subtitle": "Prices and language automatically convert in real time across the website.",
    "modal.quickCurrency": "QUICK CURRENCY:",
    "modal.active": "Active:",
    "modal.searchPlaceholder": "Search 195 countries or cities (e.g. India, USA, China, Pakistan, London, Tokyo)...",
    "modal.selected": "Selected:",
    "modal.expandView": "Expand View",
  },
  ja: {
    "nav.home": "ホーム",
    "nav.services": "サービス",
    "nav.caseStudies": "事例紹介",
    "nav.roiEstimator": "ROI見積もり",
    "nav.aboutUs": "会社概要",
    "nav.contactUs": "お問い合わせ",
    "nav.consultation": "無料相談",
    "hero.badge": "インド発「実践学習＋プロジェクト受託」最高峰プラットフォーム",
    "hero.titleRealWork": "確かな実績。",
    "hero.titleRealLearning": "真の学び。",
    "hero.titleRealGrowth": "確実な成長。",
    "hero.subtitle": "学生、スタートアップ、企業を包括的な実行力で支援。迅速なMVP構築、フルスタック開発、AIソリューション、学術研究支援を通じて、学びと実践を架橋します。",
    "hero.ctaFree": "無料相談を予約",
    "hero.ctaRoi": "プロジェクトROIを計算",
    "hero.profitable": "自己資金経営・黒字化達成",
    "hero.verified": "100% 盗用検査検証済み品質",
    "hero.rating": "評価 4.8/5 (150件以上の高評価)",
    "services.heading": "コア開発・実行サービス",
    "services.subheading": "高コンバージョンWebアプリからAIモデル、査読論文まで、完全な知識移転を伴う本番品質を提供します。",
    "projects.heading": "クライアント導入・成功事例",
    "projects.subheading": "世界各国およびインド全土に提供された、検証可能な成果と堅牢なソリューション。",
    "projects.challenge": "課題と要件",
    "projects.readCaseStudy": "事例全文を読む",
    "roi.heading": "対話型 ROI & 見積もりシミュレーター",
    "roi.subheading": "投資額、予想納期、推定投資対効果を瞬時に算出します。",
    "team.heading": "コアリーダーシップ・専門責任者",
    "team.subheading": "開発、マーケティング、学術研究、クライアント連携をリードする専任チーム。",
    "contact.heading": "アイデアを形にする準備はできましたか？",
    "contact.subheading": "専任エンジニアとの30分個別相談、または見積もり依頼はこちらから。",
    "modal.title": "国を選択 (世界195ヶ国対応)",
    "modal.subtitle": "サイト全体の価格と表示言語がリアルタイムで自動換算されます。",
    "modal.quickCurrency": "主要通貨:",
    "modal.active": "選択中:",
    "modal.searchPlaceholder": "195ヶ国または都市を検索 (例: India, Japan, Tokyo, USA)...",
    "modal.selected": "選択済み:",
    "modal.expandView": "拡大表示",
  },
  de: {
    "nav.home": "Startseite",
    "nav.services": "Leistungen",
    "nav.caseStudies": "Fallstudien",
    "nav.roiEstimator": "ROI-Rechner",
    "nav.aboutUs": "Über uns",
    "nav.contactUs": "Kontakt",
    "nav.consultation": "Kostenlose Beratung",
    "hero.badge": "INDIENS NR. 1 'LERNEN + ERGEBNIS' PROJEKTPLATTFORM",
    "hero.titleRealWork": "Echte Arbeit.",
    "hero.titleRealLearning": "Echtes Lernen.",
    "hero.titleRealGrowth": "Echtes Wachstum.",
    "hero.subtitle": "Förderung von Studierenden, Start-ups und Unternehmen mit End-to-End-Umsetzung. Wir schließen die Lücke zwischen Theorie und Praxis durch schnelle MVPs, Softwareentwicklung und KI-Lösungen.",
    "hero.ctaFree": "Kostenlose Beratung buchen",
    "hero.ctaRoi": "Projekt-ROI berechnen",
    "hero.profitable": "Eigenfinanziert & Profitabel",
    "hero.verified": "100% Geprüfte Qualität",
    "hero.rating": "4.8/5 Bewertung (150+ Rezensionen)",
    "services.heading": "Unsere Kernkompetenzen",
    "services.subheading": "Von performanten Webanwendungen bis zu KI-Modellen und wissenschaftlichen Publikationen liefern wir produktionsreife Ergebnisse.",
    "projects.heading": "Bewährte Kundenfallstudien",
    "projects.subheading": "Reale Herausforderungen, verifizierbare Messwerte und praxiserprobte Lösungen weltweit.",
    "projects.challenge": "DIE HERAUSFORDERUNG",
    "projects.readCaseStudy": "Vollständige Fallstudie lesen",
    "roi.heading": "Interaktiver ROI & Projektschätzer",
    "roi.subheading": "Berechnen Sie Ihre Investition, den Zeitplan und den voraussichtlichen Ertrag.",
    "team.heading": "Geschäftsführung & Fachexperten",
    "team.subheading": "Unser engagiertes Team für Betrieb, Entwicklung, Marketing und Partnerschaften.",
    "contact.heading": "Bereit, Ihre Idee zu verwirklichen?",
    "contact.subheading": "Vereinbaren Sie ein 30-minütiges Gespräch oder fordern Sie ein Sofortangebot an.",
    "modal.title": "Wählen Sie Ihr Land (195 Länder unterstützt)",
    "modal.subtitle": "Preise und Sprache werden automatisch in Echtzeit umgerechnet.",
    "modal.quickCurrency": "SCHNELLWÄHRUNG:",
    "modal.active": "Aktiv:",
    "modal.searchPlaceholder": "195 Länder oder Städte suchen (z. B. India, Deutschland, Berlin)...",
    "modal.selected": "Ausgewählt:",
    "modal.expandView": "Ansicht erweitern",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.services": "Services",
    "nav.caseStudies": "Études de cas",
    "nav.roiEstimator": "Estimateur de ROI",
    "nav.aboutUs": "À propos",
    "nav.contactUs": "Contact",
    "nav.consultation": "Consultation Gratuite",
    "hero.badge": "1ÈRE PLATEFORME DE PROJETS 'FORMER + RÉALISER' EN INDE",
    "hero.titleRealWork": "Vrai Travail.",
    "hero.titleRealLearning": "Vrai Savoir.",
    "hero.titleRealGrowth": "Vraie Croissance.",
    "hero.subtitle": "Accompagner étudiants, startups et entreprises avec une exécution clé en main. Nous comblons le fossé entre apprentissage et action avec des MVPs rapides, du développement web et de l'IA.",
    "hero.ctaFree": "Réserver une Consultation Gratuite",
    "hero.ctaRoi": "Calculer le ROI du projet",
    "hero.profitable": "Autofinancé & Rentable",
    "hero.verified": "Qualité 100% Vérifiée",
    "hero.rating": "Note 4.8/5 (+150 avis)",
    "services.heading": "Nos Capacités Clés d'Exécution",
    "services.subheading": "Des applications web à fort taux de conversion aux modèles d'IA et recherches scientifiques, nous livrons des résultats prêts pour la production.",
    "projects.heading": "Études de Cas Clients Éprouvées",
    "projects.subheading": "Des problèmes réels, des résultats vérifiables et des solutions éprouvées à travers le monde.",
    "projects.challenge": "LE DÉFI",
    "projects.readCaseStudy": "Lire l'Étude de Cas Complète",
    "roi.heading": "Estimateur de ROI & Projet Interactif",
    "roi.subheading": "Calculez votre investissement, vos délais prévisionnels et votre retour sur investissement.",
    "team.heading": "Direction & Responsables Techniques",
    "team.subheading": "Une équipe passionnée en charge des opérations, de l'ingénierie et du marketing.",
    "contact.heading": "Prêt à Concrétiser Votre Idée ?",
    "contact.subheading": "Planifiez un appel de découverte de 30 minutes ou demandez un devis instantané.",
    "modal.title": "Sélectionnez Votre Pays (195 Pays Pris en Charge)",
    "modal.subtitle": "Les prix et la langue sont automatiquement convertis en temps réel.",
    "modal.quickCurrency": "DEVISE RAPIDE :",
    "modal.active": "Actif :",
    "modal.searchPlaceholder": "Rechercher parmi 195 pays ou villes (ex: France, Paris, India, USA)...",
    "modal.selected": "Sélectionné :",
    "modal.expandView": "Agrandir",
  },
  es: {
    "nav.home": "Inicio",
    "nav.services": "Servicios",
    "nav.caseStudies": "Casos de éxito",
    "nav.roiEstimator": "Calculadora ROI",
    "nav.aboutUs": "Sobre nosotros",
    "nav.contactUs": "Contacto",
    "nav.consultation": "Consulta Gratuita",
    "hero.badge": "1ª PLATAFORMA DE PROYECTOS 'APRENDER + EJECUTAR' DE LA INDIA",
    "hero.titleRealWork": "Trabajo Real.",
    "hero.titleRealLearning": "Aprendizaje Real.",
    "hero.titleRealGrowth": "Crecimiento Real.",
    "hero.subtitle": "Impulsamos a estudiantes, startups y empresas con ejecución de extremo a extremo. Unimos teoría y práctica con MVPs rápidos, software moderno y soluciones de IA.",
    "hero.ctaFree": "Agendar Consulta Gratuita",
    "hero.ctaRoi": "Calcular ROI del Proyecto",
    "hero.profitable": "Rentable y Autofinanciado",
    "hero.verified": "Calidad 100% Verificada",
    "hero.rating": "Calificación 4.8/5 (+150 reseñas)",
    "services.heading": "Nuestros Servicios Principales",
    "services.subheading": "Desde aplicaciones web de alta conversión hasta IA y artículos de investigación, entregamos código listo para producción.",
    "projects.heading": "Casos de Éxito de Clientes",
    "projects.subheading": "Problemas reales, métricas verificables y soluciones implementadas en todo el mundo.",
    "projects.challenge": "EL DESAFÍO",
    "projects.readCaseStudy": "Leer Caso Completo",
    "roi.heading": "Estimador de ROI y Presupuesto",
    "roi.subheading": "Calcula tu inversión estimada, tiempos de entrega y retorno proyectado.",
    "team.heading": "Equipo Directivo y Líderes",
    "team.subheading": "Profesionales dedicados a operaciones, ingeniería, marketing y alianzas globales.",
    "contact.heading": "¿Listo para Transformar tu Idea?",
    "contact.subheading": "Agenda una llamada de descubrimiento de 30 minutos o solicita presupuesto directo.",
    "modal.title": "Selecciona Tu País (195 Países Disponibles)",
    "modal.subtitle": "Los precios y el idioma se convierten automáticamente en tiempo real.",
    "modal.quickCurrency": "MONEDA RÁPIDA:",
    "modal.active": "Activa:",
    "modal.searchPlaceholder": "Buscar entre 195 países o ciudades (ej: España, México, India)...",
    "modal.selected": "Seleccionado:",
    "modal.expandView": "Expandir",
  },
  zh: {
    "nav.home": "首页",
    "nav.services": "服务",
    "nav.caseStudies": "案例研究",
    "nav.roiEstimator": "ROI估算器",
    "nav.aboutUs": "关于我们",
    "nav.contactUs": "联系我们",
    "nav.consultation": "免费咨询",
    "hero.badge": "印度首家“实战教学 + 项目交付”标杆平台",
    "hero.titleRealWork": "真实成果。",
    "hero.titleRealLearning": "深度学习。",
    "hero.titleRealGrowth": "持续增长。",
    "hero.subtitle": "助力高校学子、创业团队及企业实现端到端项目落地。通过敏捷MVP交付、全栈软件开发、前沿AI模型及学术科研支持，打通学习与实践的壁垒。",
    "hero.ctaFree": "预约免费咨询",
    "hero.ctaRoi": "测算项目投资回报率",
    "hero.profitable": "自主盈利企业",
    "hero.verified": "100% 原创严选品质保证",
    "hero.rating": "4.8/5 高分好评 (150+ 客户见证)",
    "services.heading": "核心业务与技术交付能力",
    "services.subheading": "从高转化网站、移动应用到行业AI大模型及顶会学术论文，全方位保障高标准交付。",
    "projects.heading": "成熟客户成功案例",
    "projects.subheading": "直击业务痛点，数据指标可查，交付经验覆盖印度及全球195个国家。",
    "projects.challenge": "核心挑战",
    "projects.readCaseStudy": "查看完整案例报告",
    "roi.heading": "交互式投资回报率与预算评估",
    "roi.subheading": "即时测算您的项目预算、交付周期与预期业务回报。",
    "team.heading": "核心管理与技术团队",
    "team.subheading": "深耕工程开发、运营管理、市场拓展与客户服务的精英团队。",
    "contact.heading": "准备好将您的想法落地了吗？",
    "contact.subheading": "预约30分钟技术与方案沟通，或获取即时定制报价。",
    "modal.title": "选择国家 / 地区 (支持全球195个国家)",
    "modal.subtitle": "网站价格与界面语言将在全站实时自动换算与切换。",
    "modal.quickCurrency": "常用快捷货币:",
    "modal.active": "当前货币:",
    "modal.searchPlaceholder": "搜索全球195个国家或城市 (例如: 中国, 北京, 美国, 日本)...",
    "modal.selected": "当前已选:",
    "modal.expandView": "展开视图",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.services": "الخدمات",
    "nav.caseStudies": "دراسات الحالة",
    "nav.roiEstimator": "حاسبة العائد",
    "nav.aboutUs": "معلومات عنا",
    "nav.contactUs": "اتصل بنا",
    "nav.consultation": "استشارة مجانية",
    "hero.badge": "المنصة الأولى لمشاريع 'تعليم + تنفيذ' في الهند",
    "hero.titleRealWork": "عمل حقيقي.",
    "hero.titleRealLearning": "تعلم حقيقي.",
    "hero.titleRealGrowth": "نمو حقيقي.",
    "hero.subtitle": "تمكين الطلاب والشركات الناشئة والمؤسسات من التنفيذ الشامل. نسد الفجوة بين التعلم والعمل من خلال بناء نماذج أولية سريعة وتطوير البرمجيات وحلول الذكاء الاصطناعي.",
    "hero.ctaFree": "احجز استشارة مجانية",
    "hero.ctaRoi": "احسب عائد المشروع",
    "hero.profitable": "مربحة وممولة ذاتياً",
    "hero.verified": "جودة معتمدة وموثقة 100%",
    "hero.rating": "تقييم 4.8/5 (أكثر من 150 مراجعة)",
    "services.heading": "قدراتنا التنفيذية الأساسية",
    "services.subheading": "من تطبيقات الويب المتقدمة إلى نماذج الذكاء الاصطناعي والبحوث الأكاديمية، نقدم نتائج جاهزة للإنتاج.",
    "projects.heading": "دراسات حالة موثقة للعملاء",
    "projects.subheading": "تحديات حقيقية وحلول مجربة تم تسليمها في الهند وحول العالم.",
    "projects.challenge": "التحدي الرئيسي",
    "projects.readCaseStudy": "قراءة دراسة الحالة كاملة",
    "roi.heading": "حاسبة العائد وتقدير الميزانية",
    "roi.subheading": "احسب استثمارك والجدول الزمني والعائد المتوقع لمشروعك.",
    "team.heading": "فريق القيادة والخبراء",
    "team.subheading": "فريق متخصص في إدارة العمليات والتطوير الهندسي والتسويق.",
    "contact.heading": "هل أنت مستعد لتحويل فكرتك إلى واقع؟",
    "contact.subheading": "حدد موعد مكالمة استكشافية لمدة 30 دقيقة أو اطلب عرض سعر فوري.",
    "modal.title": "اختر دولتك (195 دولة مدعومة)",
    "modal.subtitle": "يتم تحويل الأسعار واللغة تلقائياً في الوقت الفعلي عبر الموقع.",
    "modal.quickCurrency": "العملات الشائعة:",
    "modal.active": "العملة النشطة:",
    "modal.searchPlaceholder": "ابحث في 195 دولة أو مدينة (مثل: الإمارات، مصر، السعودية)...",
    "modal.selected": "المحدد:",
    "modal.expandView": "عرض موسع",
  },
  ru: {
    "nav.home": "Главная",
    "nav.services": "Услуги",
    "nav.caseStudies": "Кейсы",
    "nav.roiEstimator": "Калькулятор ROI",
    "nav.aboutUs": "О нас",
    "nav.contactUs": "Контакты",
    "nav.consultation": "Бесплатная консультация",
    "hero.badge": "ПЛАТФОРМА №1 В ИНДИИ: 'ОБУЧЕНИЕ + РЕАЛИЗАЦИЯ'",
    "hero.titleRealWork": "Реальная работа.",
    "hero.titleRealLearning": "Настоящее обучение.",
    "hero.titleRealGrowth": "Реальный рост.",
    "hero.subtitle": "Помогаем студентам, стартапам и компаниям воплощать идеи. Мы соединяем теорию и практику через создание MVP, разработку ПО и внедрение ИИ.",
    "hero.ctaFree": "Записаться на консультацию",
    "hero.ctaRoi": "Рассчитать окупаемость",
    "hero.profitable": "Прибыльная компания без инвестиций",
    "hero.verified": "100% Проверенное качество",
    "hero.rating": "Рейтинг 4.8/5 (150+ отзывов)",
    "services.heading": "Наши ключевые компетенции",
    "services.subheading": "От веб-сервисов до моделей искусственного интеллекта и научных публикаций с полной передачей знаний.",
    "projects.heading": "Успешные кейсы клиентов",
    "projects.subheading": "Реальные бизнес-задачи, прозрачные метрики и надежные решения по всему миру.",
    "projects.challenge": "ЗАДАЧА ПРОЕКТА",
    "projects.readCaseStudy": "Читать кейс полностью",
    "roi.heading": "Интерактивный расчет окупаемости",
    "roi.subheading": "Оцените объем инвестиций, сроки выполнения и прогноз доходности.",
    "team.heading": "Руководство и ведущие инженеры",
    "team.subheading": "Команда профессионалов в разработке, маркетинге и партнерствах.",
    "contact.heading": "Готовы воплотить вашу идею?",
    "contact.subheading": "Запишитесь на 30-минутный звонок или запросите расчет стоимости.",
    "modal.title": "Выберите страну (Поддержка 195 стран)",
    "modal.subtitle": "Цены и язык автоматически конвертируются в реальном времени.",
    "modal.quickCurrency": "БЫСТРЫЕ ВАЛЮТЫ:",
    "modal.active": "Активная:",
    "modal.searchPlaceholder": "Поиск по 195 странам и городам (напр. Россия, Индия, Москва)...",
    "modal.selected": "Выбрано:",
    "modal.expandView": "Развернуть",
  },
  it: {
    "nav.home": "Home",
    "nav.services": "Servizi",
    "nav.caseStudies": "Casi studio",
    "nav.roiEstimator": "Stima ROI",
    "nav.aboutUs": "Chi siamo",
    "nav.contactUs": "Contatti",
    "nav.consultation": "Consulenza Gratuita",
    "hero.badge": "PIATTAFORMA LEADER 'IMPARARE + ESEGUIRE' IN INDIA",
    "hero.titleRealWork": "Lavoro Reale.",
    "hero.titleRealLearning": "Vero Apprendimento.",
    "hero.titleRealGrowth": "Crescita Reale.",
    "hero.subtitle": "Supportiamo studenti, startup e aziende con un'esecuzione completa. Uniamo teoria e pratica con MVP rapidi, sviluppo software e soluzioni di intelligenza artificiale.",
    "hero.ctaFree": "Prenota Consulenza Gratuita",
    "hero.ctaRoi": "Calcola il ROI del Progetto",
    "hero.profitable": "Autofinanziata e Redditizia",
    "hero.verified": "Qualità Verificata al 100%",
    "hero.rating": "Valutazione 4.8/5 (+150 recensioni)",
    "services.heading": "I Nostri Servizi Principali",
    "services.subheading": "Dalle applicazioni web scalabili all'IA e alla ricerca scientifica, garantiamo standard di produzione elevati.",
    "projects.heading": "Casi di Successo dei Clienti",
    "projects.subheading": "Sfide reali, risultati misurabili e soluzioni adottate in tutto il mondo.",
    "projects.challenge": "LA SFIDA",
    "projects.readCaseStudy": "Leggi il Caso Studio",
    "roi.heading": "Calcolatore Interattivo del ROI",
    "roi.subheading": "Calcola l'investimento, i tempi di consegna e il rendimento atteso.",
    "team.heading": "Leadership e Responsabili Tecnici",
    "team.subheading": "Un team dedicato a operazioni, sviluppo, marketing e partnership.",
    "contact.heading": "Pronto a Realizzare la Tua Idea?",
    "contact.subheading": "Prenota una chiamata di 30 minuti o richiedi un preventivo immediato.",
    "modal.title": "Seleziona il Tuo Paese (195 Paesi Supportati)",
    "modal.subtitle": "I prezzi e la lingua si convertono automaticamente in tempo reale.",
    "modal.quickCurrency": "VALUTA RAPIDA:",
    "modal.active": "Attiva:",
    "modal.searchPlaceholder": "Cerca tra 195 paesi o città (es. Italia, Roma, India)...",
    "modal.selected": "Selezionato:",
    "modal.expandView": "Espandi",
  },
  ko: {
    "nav.home": "홈",
    "nav.services": "서비스",
    "nav.caseStudies": "성공 사례",
    "nav.roiEstimator": "ROI 계산기",
    "nav.aboutUs": "회사 소개",
    "nav.contactUs": "문의하기",
    "nav.consultation": "무료 상담",
    "hero.badge": "인도 최초의 '실무 학습 + 완벽 실행' 프로젝트 플랫폼",
    "hero.titleRealWork": "진짜 결과.",
    "hero.titleRealLearning": "진정한 배움.",
    "hero.titleRealGrowth": "확실한 성장.",
    "hero.subtitle": "학생, 스타트업, 기업을 위한 엔드투엔드 프로젝트 실행. 신속한 MVP 구축, 풀스택 개발, AI 솔루션 및 연구 논문 지원을 통해 이론과 실무를 연결합니다.",
    "hero.ctaFree": "무료 상담 예약하기",
    "hero.ctaRoi": "프로젝트 ROI 계산하기",
    "hero.profitable": "자체 자본 운영 및 흑자 달성",
    "hero.verified": "100% 품질 검증 완료",
    "hero.rating": "평점 4.8/5 (150개 이상의 후기)",
    "services.heading": "핵심 개발 및 실행 역량",
    "services.subheading": "고전환 웹 애플리케이션부터 AI 모델, 학술 연구 논문까지 지식 이전과 함께 상용화 품질로 제공합니다.",
    "projects.heading": "검증된 고객 성공 사례",
    "projects.subheading": "전 세계 및 인도 전역에 제공된 실제 문제 해결 및 측정 가능한 성과.",
    "projects.challenge": "핵심 과제",
    "projects.readCaseStudy": "성공 사례 전문 읽기",
    "roi.heading": "인터랙티브 ROI & 견적 시뮬레이터",
    "roi.subheading": "투자 비용, 예상 납기 및 비즈니스 기대 효과를 즉시 산출하세요.",
    "team.heading": "핵심 경영진 및 기술 리더",
    "team.subheading": "운영, 엔지니어링, 마케팅, 글로벌 파트너십을 이끄는 전문 팀.",
    "contact.heading": "아이디어를 실현할 준비가 되셨나요?",
    "contact.subheading": "30분 무료 기술 상담을 예약하거나 즉시 프로젝트 견적을 받아보세요.",
    "modal.title": "국가 선택 (전 세계 195개국 지원)",
    "modal.subtitle": "사이트 전체의 가격과 언어가 실시간으로 자동 변환됩니다.",
    "modal.quickCurrency": "주요 통화:",
    "modal.active": "선택된 통화:",
    "modal.searchPlaceholder": "195개 국가 또는 도시 검색 (예: 대한민국, 서울, India, USA)...",
    "modal.selected": "선택됨:",
    "modal.expandView": "확대 보기",
  },
  pt: {
    "nav.home": "Início",
    "nav.services": "Serviços",
    "nav.caseStudies": "Casos de Sucesso",
    "nav.roiEstimator": "Calculadora ROI",
    "nav.aboutUs": "Sobre Nós",
    "nav.contactUs": "Contato",
    "nav.consultation": "Consulta Gratuita",
    "hero.badge": "1ª PLATAFORMA 'APRENDER + EXECUTAR' DA ÍNDIA",
    "hero.titleRealWork": "Trabalho Real.",
    "hero.titleRealLearning": "Aprendizado Real.",
    "hero.titleRealGrowth": "Crescimento Real.",
    "hero.subtitle": "Capacitamos estudantes, startups e empresas com execução de ponta a ponta. Unimos teoria e prática com MVPs rápidos, desenvolvimento web e IA.",
    "hero.ctaFree": "Agendar Consulta Gratuita",
    "hero.ctaRoi": "Calcular ROI do Projeto",
    "hero.profitable": "Rentável e Autofinanciada",
    "hero.verified": "Qualidade 100% Verificada",
    "hero.rating": "Avaliação 4.8/5 (+150 avaliações)",
    "services.heading": "Nossos Principais Serviços",
    "services.subheading": "De aplicações web de alta conversão a modelos de IA e artigos científicos, entregamos padrões de produção.",
    "projects.heading": "Casos de Sucesso Comprovados",
    "projects.subheading": "Problemas reais, métricas verificáveis e soluções entregues em todo o mundo.",
    "projects.challenge": "O DESAFIO",
    "projects.readCaseStudy": "Ler Caso de Sucesso Completo",
    "roi.heading": "Estimador de ROI Interativo",
    "roi.subheading": "Calcule seu investimento, prazos de entrega e retorno estimado.",
    "team.heading": "Liderança e Especialistas",
    "team.subheading": "Equipe dedicada a operações, engenharia, marketing e parcerias.",
    "contact.heading": "Pronto para Transformar sua Ideia?",
    "contact.subheading": "Agende uma conversa de 30 minutos ou solicite um orçamento direto.",
    "modal.title": "Selecione seu País (195 Países Suportados)",
    "modal.subtitle": "Preços e idioma são convertidos automaticamente em tempo real.",
    "modal.quickCurrency": "MOEDA RÁPIDA:",
    "modal.active": "Ativa:",
    "modal.searchPlaceholder": "Buscar em 195 países ou cidades (ex: Brasil, Portugal, Índia)...",
    "modal.selected": "Selecionado:",
    "modal.expandView": "Expandir",
  },
  tr: {
    "nav.home": "Ana Sayfa",
    "nav.services": "Hizmetler",
    "nav.caseStudies": "Örnek Olaylar",
    "nav.roiEstimator": "Yatırım Getirisi",
    "nav.aboutUs": "Hakkımızda",
    "nav.contactUs": "İletişim",
    "nav.consultation": "Ücretsiz Danışmanlık",
    "hero.badge": "HİNDİSTAN'IN 1 NUMARALI 'ÖĞREN + TAMAMLA' PROJE PLATFORMU",
    "hero.titleRealWork": "Gerçek İş.",
    "hero.titleRealLearning": "Gerçek Öğrenme.",
    "hero.titleRealGrowth": "Gerçek Büyüme.",
    "hero.subtitle": "Öğrencileri, girişimleri ve şirketleri uçtan uca teslimatla güçlendiriyoruz. Hızlı MVP'ler, yazılım geliştirme ve yapay zeka çözümleri sunuyoruz.",
    "hero.ctaFree": "Ücretsiz Danışmanlık Al",
    "hero.ctaRoi": "Proje Getirisini Hesapla",
    "hero.profitable": "Öz Kaynaklı ve Karlı",
    "hero.verified": "%100 Doğrulanmış Kalite",
    "hero.rating": "4.8/5 Puan (150+ Değerlendirme)",
    "services.heading": "Temel Hizmetlerimiz",
    "services.subheading": "Yüksek dönüşümlü web uygulamalarından yapay zeka ve akademik araştırmalara kadar üretim kalitesinde teslimat.",
    "projects.heading": "Müşteri Başarı Hikayeleri",
    "projects.subheading": "Tüm dünyada teslim edilmiş gerçek zorluklar ve ölçülebilir başarılar.",
    "projects.challenge": "ZORLUK",
    "projects.readCaseStudy": "Detaylı İncele",
    "roi.heading": "Yatırım Getirisi Hesaplayıcı",
    "roi.subheading": "Yatırımınızı, teslimat takvimini ve tahmini getiriyi hesaplayın.",
    "team.heading": "Liderlik ve Uzman Ekibimiz",
    "team.subheading": "Operasyon, yazılım ve pazarlamayı yöneten profesyonel ekip.",
    "contact.heading": "Fikrinizi Dönüştürmeye Hazır Mısınız?",
    "contact.subheading": "30 dakikalık keşif görüşmesi planlayın veya anında teklif alın.",
    "modal.title": "Ülkenizi Seçin (195 Ülke Desteklenmektedir)",
    "modal.subtitle": "Fiyatlar ve dil site genelinde gerçek zamanlı olarak otomatik çevrilir.",
    "modal.quickCurrency": "HIZLI PARA BİRİMİ:",
    "modal.active": "Aktif:",
    "modal.searchPlaceholder": "195 ülke veya şehir arayın (Örn: Türkiye, İstanbul, India)...",
    "modal.selected": "Seçilen:",
    "modal.expandView": "Görünümü Genişlet",
  }
};

interface CountryContextType {
  selectedCountry: CountryItem;
  setSelectedCountry: (country: CountryItem) => void;
  selectCountryByCode: (code: string) => void;
  selectQuickCurrency: (currencyCode: string) => void;
  formatPrice: (inrAmount: number) => string;
  convertBudget: (rawStr: string) => string;
  t: (key: string, defaultText?: string) => string;
  isCountriesModalOpen: boolean;
  openCountriesModal: () => void;
  closeCountriesModal: () => void;
}

const defaultCountry = COUNTRIES_195.find((c) => c.code === "IN") || COUNTRIES_195[0];

const CountryContext = createContext<CountryContextType>({
  selectedCountry: defaultCountry,
  setSelectedCountry: () => {},
  selectCountryByCode: () => {},
  selectQuickCurrency: () => {},
  formatPrice: () => "",
  convertBudget: (s) => s,
  t: (k, d) => d || k,
  isCountriesModalOpen: false,
  openCountriesModal: () => {},
  closeCountriesModal: () => {},
});

export const CountryProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCountry, setSelectedCountryState] = useState<CountryItem>(defaultCountry);
  const [isCountriesModalOpen, setIsCountriesModalOpen] = useState(false);

  // Restore country preference from localStorage if available
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem("ks_selected_country");
      if (savedCode) {
        const match = COUNTRIES_195.find((c) => c.code === savedCode);
        if (match) setSelectedCountryState(match);
      }
    } catch {}
  }, []);

  const setSelectedCountry = (country: CountryItem) => {
    setSelectedCountryState(country);
    try {
      localStorage.setItem("ks_selected_country", country.code);
    } catch {}
  };

  const selectCountryByCode = (code: string) => {
    const match = COUNTRIES_195.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (match) setSelectedCountry(match);
  };

  const selectQuickCurrency = (currencyCode: string) => {
    const match = COUNTRIES_195.find((c) => c.currency.toUpperCase() === currencyCode.toUpperCase());
    if (match) setSelectedCountry(match);
  };

  const openCountriesModal = () => setIsCountriesModalOpen(true);
  const closeCountriesModal = () => setIsCountriesModalOpen(false);

  // Currency Converter Formatter
  const formatPrice = (inrAmount: number): string => {
    if (!selectedCountry) return `₹${inrAmount.toLocaleString('en-IN')}`;
    
    // For India, always format in Indian Rupees
    if (selectedCountry.code === "IN") {
      return `₹${inrAmount.toLocaleString('en-IN')}`;
    }

    const converted = Math.round(inrAmount * selectedCountry.rate);
    const sym = selectedCountry.symbol;
    
    // Clean symbol spacing
    const needsSpace = sym.length > 2 || sym === "AED" || sym === "SAR" || sym === "CHF";
    const prefix = needsSpace ? `${sym} ` : sym;

    return `${prefix}${converted.toLocaleString()}`;
  };

  // Convert raw price strings like "₹75,000", "₹10,000 - ₹2,00,000", "₹25 Lakh"
  const convertBudget = (rawStr: string): string => {
    if (!rawStr || selectedCountry.code === "IN") return rawStr;

    // Handle range e.g. "₹10,000 - ₹2,00,000"
    if (rawStr.includes("-")) {
      const parts = rawStr.split("-");
      const cleanMin = parseInt(parts[0].replace(/[^0-9]/g, ""), 10);
      const cleanMax = parseInt(parts[1].replace(/[^0-9]/g, ""), 10);
      if (!isNaN(cleanMin) && !isNaN(cleanMax)) {
        return `${formatPrice(cleanMin)} - ${formatPrice(cleanMax)}`;
      }
    }

    // Handle single number e.g. "₹75,000"
    const num = parseInt(rawStr.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num) && num > 0) {
      // Special handle Lakhs e.g. "₹25 Lakh" -> 2,500,000
      if (rawStr.toLowerCase().includes("lakh") || rawStr.toLowerCase().includes("lac")) {
        const inrVal = num * 100000;
        return formatPrice(inrVal);
      }
      return formatPrice(num);
    }

    return rawStr;
  };

  // Language Translation Function
  // Rule: If India is selected, always show English as instructed.
  // If another country is selected, show that country's language.
  const t = (key: string, defaultText?: string): string => {
    // If India, strictly English
    if (selectedCountry.code === "IN") {
      return TRANSLATIONS.en[key] || defaultText || key;
    }

    const lang = selectedCountry.lang || "en";
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || defaultText || key;
  };

  const value = useMemo(
    () => ({
      selectedCountry,
      setSelectedCountry,
      selectCountryByCode,
      selectQuickCurrency,
      formatPrice,
      convertBudget,
      t,
      isCountriesModalOpen,
      openCountriesModal,
      closeCountriesModal,
    }),
    [selectedCountry, isCountriesModalOpen]
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
};

export const useCountry = () => useContext(CountryContext);
