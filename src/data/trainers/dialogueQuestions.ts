import type { DialogueQuestion } from './dialogueTypes.ts'

export const dialogueCategories = [
  { id: 'introductions', label: 'Знакомство и приветствия' },
  { id: 'about-yourself', label: 'Общение о себе' },
  { id: 'everyday-talk', label: 'Повседневный разговор' },
  { id: 'places-travel', label: 'Места и передвижение' },
  { id: 'plans-time', label: 'Планы и время' },
  { id: 'politeness-requests', label: 'Вежливость и просьбы' },
] as const

export const dialogueQuestions: DialogueQuestion[] = [
  {
    id: 'd-intro-01', level: 'A1', categoryId: 'introductions', situationId: 'first-meeting-name', intentId: 'give-personal-information', replySpeaker: 'Άννα',
    context: [
      { speaker: 'Νίκος', greek: 'Γεια σου! Πώς σε λένε;', translation: 'Привет! Как тебя зовут?' },
    ],
    options: [
      { id: 'name', greek: 'Με λένε Άννα.', translation: 'Меня зовут Анна.', explanation: 'Это ответ на вопрос об имени.' },
      { id: 'origin', greek: 'Είμαι από την Ελλάδα.', translation: 'Я из Греции.', explanation: 'Здесь спрашивают имя, а не откуда ты.' },
      { id: 'home', greek: 'Μένω στη Λάρνακα.', translation: 'Я живу в Ларнаке.', explanation: 'Здесь спрашивают имя, а не где ты живёшь.' },
    ],
    correctOptionId: 'name', explanation: 'Никос спрашивает, как тебя зовут.',
  },
  {
    id: 'd-intro-02', level: 'A1', categoryId: 'introductions', situationId: 'meet-new-colleague', intentId: 'respond-to-social-formula', replySpeaker: 'Εσύ',
    context: [
      { speaker: 'Μαρία', greek: 'Από εδώ ο κύριος Παπαδόπουλος, ο νέος γιατρός μας.', translation: 'Познакомьтесь: это господин Пападопулос, наш новый врач.' },
      { speaker: 'Γιατρός', greek: 'Χάρηκα πολύ.', translation: 'Очень приятно.' },
    ],
    options: [
      { id: 'pleasure', greek: 'Κι εγώ, κύριε Παπαδόπουλε.', translation: 'Мне тоже, господин Пападопулос.', explanation: 'Так отвечают при знакомстве.' },
      { id: 'recovery', greek: 'Περαστικά σας.', translation: 'Выздоравливайте.', explanation: 'Это пожелание тому, кто болеет.' },
      { id: 'trip', greek: 'Καλό ταξίδι.', translation: 'Счастливого пути.', explanation: 'Это пожелание перед поездкой.' },
    ],
    correctOptionId: 'pleasure', explanation: 'Вас только что познакомили; уместно ответить, что вам тоже приятно.',
  },
  {
    id: 'd-intro-03', level: 'A1', categoryId: 'introductions', situationId: 'exam-good-luck', intentId: 'respond-to-social-formula', replySpeaker: 'Εσύ',
    context: [
      { speaker: 'Ελένη', greek: 'Καλή επιτυχία στις εξετάσεις αύριο!', translation: 'Удачи на экзамене завтра!' },
    ],
    options: [
      { id: 'thanks', greek: 'Ευχαριστώ πολύ! Θα κάνω ό,τι μπορώ.', translation: 'Большое спасибо! Я сделаю всё, что смогу.', explanation: 'Это благодарность за пожелание удачи.' },
      { id: 'birthday', greek: 'Χρόνια πολλά!', translation: 'С днём рождения! / Всего доброго!', explanation: 'Так поздравляют с праздником, а здесь желают удачи на экзамене.' },
      { id: 'health', greek: 'Περαστικά!', translation: 'Выздоравливай!', explanation: 'Так говорят человеку, который болеет.' },
    ],
    correctOptionId: 'thanks', explanation: 'Элени желает удачи, поэтому ответ начинается с благодарности.',
  },
  {
    id: 'd-intro-04', level: 'A1', categoryId: 'introductions', situationId: 'welcome-new-student', intentId: 'respond-to-social-formula', replySpeaker: 'Άννα',
    context: [
      { speaker: 'Δασκάλα', greek: 'Καλώς ήρθες στην τάξη μας, Άννα!', translation: 'Добро пожаловать в наш класс, Анна!' },
    ],
    options: [
      { id: 'welcome', greek: 'Ευχαριστώ! Χαίρομαι που είμαι εδώ.', translation: 'Спасибо! Я рада быть здесь.', explanation: 'Так можно ответить на приветствие в новом классе.' },
      { id: 'origin', greek: 'Είμαι από την Αθήνα.', translation: 'Я из Афин.', explanation: 'Это сообщает, откуда Анна, но не отвечает на приветствие.' },
      { id: 'home', greek: 'Μένω κοντά στο σχολείο.', translation: 'Я живу недалеко от школы.', explanation: 'Это сообщает, где Анна живёт, но не отвечает на приветствие.' },
    ],
    correctOptionId: 'welcome', explanation: 'Учительница приветствует Анну в новом классе.',
  },
  {
    id: 'd-intro-05', level: 'A2', categoryId: 'introductions', situationId: 'how-met-maria', intentId: 'explain-how-people-met', replySpeaker: 'Ελένη',
    context: [
      { speaker: 'Νίκος', greek: 'Ξέρεις τη Μαρία;', translation: 'Ты знаешь Марию?' },
      { speaker: 'Ελένη', greek: 'Ναι, είμαστε φίλες.', translation: 'Да, мы подруги.' },
      { speaker: 'Νίκος', greek: 'Πώς γνωριστήκατε;', translation: 'Как вы познакомились?' },
    ],
    options: [
      { id: 'work', greek: 'Γνωριστήκαμε στη δουλειά.', translation: 'Мы познакомились на работе.', explanation: 'Это объясняет, как они познакомились.' },
      { id: 'address', greek: 'Μένουμε στην ίδια πόλη.', translation: 'Мы живём в одном городе.', explanation: 'Это говорит, где они живут, но не как познакомились.' },
      { id: 'age', greek: 'Είναι τριάντα χρονών.', translation: 'Ей тридцать лет.', explanation: 'Это сообщает возраст Марии.' },
    ],
    correctOptionId: 'work', explanation: 'Никос спрашивает о знакомстве, а не о месте жительства или возрасте.',
  },
  {
    id: 'd-intro-06', level: 'A2', categoryId: 'introductions', situationId: 'years-in-paphos', intentId: 'repeat-missed-information', replySpeaker: 'Άννα',
    context: [
      { speaker: 'Άννα', greek: 'Από το 2023 ζω στην Πάφο. Πριν έμενα στη Λεμεσό.', translation: 'С 2023 года я живу в Пафосе. Раньше я жила в Лимасоле.' },
      { speaker: 'Νίκος', greek: 'Συγγνώμη, δεν άκουσα τη χρονιά. Από πότε μένεις στην Πάφο;', translation: 'Извини, я не расслышал год. С какого времени ты живёшь в Пафосе?' },
    ],
    options: [
      { id: 'duration', greek: 'Από το 2023.', translation: 'С 2023 года.', explanation: 'Это отвечает, как давно Анна живёт в Пафосе.' },
      { id: 'previous-city', greek: 'Πριν έμενα στη Λεμεσό.', translation: 'Раньше я жила в Лимасоле.', explanation: 'Это повторяет, где Анна жила раньше.' },
      { id: 'nationality', greek: 'Είμαι από την Ελλάδα.', translation: 'Я из Греции.', explanation: 'Это сообщает, откуда Анна родом.' },
    ],
    correctOptionId: 'duration', explanation: 'В предыдущей реплике Анна сказала, что переехала в Пафос в 2023 году.',
  },

  {
    id: 'd-self-01', level: 'A1', categoryId: 'about-yourself', situationId: 'new-student-occupation', intentId: 'give-personal-information', replySpeaker: 'Εσύ',
    context: [
      { speaker: 'Μαρία', greek: 'Τι σπουδάζεις στο πανεπιστήμιο;', translation: 'Что ты изучаешь в университете?' },
    ],
    options: [
      { id: 'study', greek: 'Σπουδάζω ιατρική.', translation: 'Я изучаю медицину.', explanation: 'Это называет предмет учёбы.' },
      { id: 'home', greek: 'Μένω κοντά στο πανεπιστήμιο.', translation: 'Я живу недалеко от университета.', explanation: 'Это говорит, где ты живёшь, а не чем занимаешься.' },
      { id: 'family', greek: 'Η αδελφή μου είναι γιατρός.', translation: 'Моя сестра — врач.', explanation: 'Это рассказывает о сестре, а не о тебе.' },
    ],
    correctOptionId: 'study', explanation: 'Мария спрашивает, что изучает собеседник в университете; ответ называет медицину.',
  },
  {
    id: 'd-self-02', level: 'A1', categoryId: 'about-yourself', situationId: 'siblings-question', intentId: 'give-personal-information', replySpeaker: 'Εσύ',
    context: [
      { speaker: 'Νίκος', greek: 'Πόσα αδέλφια έχεις;', translation: 'Сколько у тебя братьев и сестёр?' },
    ],
    options: [
      { id: 'siblings', greek: 'Έχω έναν αδελφό και μία αδελφή.', translation: 'У меня есть брат и сестра.', explanation: 'Это отвечает на вопрос, называя число братьев и сестёр.' },
      { id: 'brother-study', greek: 'Ο αδελφός μου σπουδάζει ιατρική.', translation: 'Мой брат изучает медицину.', explanation: 'Это рассказывает об учёбе брата, но не отвечает на вопрос о числе братьев и сестёр.' },
      { id: 'sister-work', greek: 'Η αδελφή μου εργάζεται σε ένα σχολείο.', translation: 'Моя сестра работает в школе.', explanation: 'Это рассказывает о работе сестры, но не отвечает на вопрос о количестве.' },
    ],
    correctOptionId: 'siblings', explanation: 'Никос спрашивает, сколько у собеседника братьев и сестёр; ответ называет брата и сестру.',
  },
  {
    id: 'd-self-03', level: 'A2', categoryId: 'about-yourself', situationId: 'sisters-job', intentId: 'give-personal-information', replySpeaker: 'Ελένη',
    context: [
      { speaker: 'Ελένη', greek: 'Η αδελφή μου διδάσκει σε ένα δημοτικό σχολείο.', translation: 'Моя сестра преподаёт в начальной школе.' },
      { speaker: 'Άννα', greek: 'Τι δουλειά κάνει;', translation: 'Кем она работает?' },
    ],
    options: [
      { id: 'teacher', greek: 'Είναι δασκάλα.', translation: 'Она учительница.', explanation: 'Это называет профессию сестры.' },
      { id: 'student', greek: 'Σπουδάζει στο πανεπιστήμιο.', translation: 'Она учится в университете.', explanation: 'Это говорит об учёбе, а не о работе в школе.' },
      { id: 'place', greek: 'Μένει κοντά στο σχολείο.', translation: 'Она живёт недалеко от школы.', explanation: 'Это говорит о месте жительства.' },
    ],
    correctOptionId: 'teacher', explanation: 'Речь идёт о работе сестры в начальной школе.',
  },
  {
    id: 'd-self-04', level: 'A2', categoryId: 'about-yourself', situationId: 'hotel-work-duties', intentId: 'give-personal-information', replySpeaker: 'Νίκος',
    context: [
      { speaker: 'Νίκος', greek: 'Δουλεύω σε ένα ξενοδοχείο. Αρχίζω τη δουλειά στις οκτώ το πρωί.', translation: 'Я работаю в гостинице. Начинаю работу в восемь утра.' },
      { speaker: 'Μαρία', greek: 'Τι κάνεις εκεί;', translation: 'Что ты там делаешь?' },
    ],
    options: [
      { id: 'duties', greek: 'Βοηθάω τους πελάτες και απαντώ στις ερωτήσεις τους.', translation: 'Я помогаю гостям и отвечаю на их вопросы.', explanation: 'Это описывает обязанности в гостинице.' },
      { id: 'commute', greek: 'Πηγαίνω στη δουλειά με λεωφορείο.', translation: 'Я езжу на работу на автобусе.', explanation: 'Это говорит о дороге на работу.' },
      { id: 'schedule', greek: 'Το ξενοδοχείο είναι ανοιχτό όλη μέρα.', translation: 'Гостиница открыта весь день.', explanation: 'Это рассказывает о часах работы гостиницы.' },
    ],
    correctOptionId: 'duties', explanation: 'Мария спрашивает, какую работу выполняет Никос в гостинице.',
  },
  {
    id: 'd-self-05', level: 'A2', categoryId: 'about-yourself', situationId: 'usual-weekend-market', intentId: 'give-personal-information', replySpeaker: 'Άννα',
    context: [
      { speaker: 'Άννα', greek: 'Το Σάββατο το πρωί πηγαίνω συχνά στη λαϊκή αγορά.', translation: 'По субботам утром я часто хожу на рынок.' },
      { speaker: 'Ελένη', greek: 'Τι κάνεις εκεί;', translation: 'Что ты там делаешь?' },
    ],
    options: [
      { id: 'market', greek: 'Αγοράζω φρούτα και λαχανικά για την εβδομάδα.', translation: 'Я покупаю фрукты и овощи на неделю.', explanation: 'Это говорит, что Анна делает на рынке.' },
      { id: 'work', greek: 'Εργάζομαι σε ένα εστιατόριο.', translation: 'Я работаю в ресторане.', explanation: 'Это говорит о работе, а не о походе на рынок.' },
      { id: 'family', greek: 'Η οικογένειά μου μένει στην Πάφο.', translation: 'Моя семья живёт в Пафосе.', explanation: 'Это информация о семье.' },
    ],
    correctOptionId: 'market', explanation: 'Элени спрашивает, что Анна делает, когда ходит на рынок.',
  },
  {
    id: 'd-self-06', level: 'A2', categoryId: 'about-yourself', situationId: 'practice-greek-with-neighbours', intentId: 'give-personal-information', replySpeaker: 'Μαρία',
    context: [
      { speaker: 'Μαρία', greek: 'Θέλω να βελτιώσω τα ελληνικά μου. Οι γείτονές μου μιλούν ελληνικά.', translation: 'Я хочу улучшить свой греческий. Мои соседи говорят по-гречески.' },
      { speaker: 'Νίκος', greek: 'Τι κάνεις μαζί τους για να βελτιώσεις τα ελληνικά σου;', translation: 'Что ты делаешь вместе с ними, чтобы улучшать свой греческий?' },
    ],
    options: [
      { id: 'practice', greek: 'Μιλάω μαζί τους κάθε απόγευμα.', translation: 'Я говорю с ними каждый день после обеда.', explanation: 'Соседи говорят по-гречески, поэтому разговор с ними помогает Марии практиковаться.' },
      { id: 'work', greek: 'Διαβάζω ένα βιβλίο κάθε απόγευμα.', translation: 'Я читаю книгу каждый день после обеда.', explanation: 'Это может быть занятием, но не отвечает, как Мария общается с грекоязычными соседями.' },
      { id: 'travel', greek: 'Πηγαίνω στην Ελλάδα κάθε καλοκαίρι.', translation: 'Я езжу в Грецию каждое лето.', explanation: 'Это говорит о поездках.' },
    ],
    correctOptionId: 'practice', explanation: 'Мария уже сказала, что каждый день видит грекоязычных соседей; Никос уточняет, разговаривают ли они.',
  },

  {
    id: 'd-everyday-01', level: 'A1', categoryId: 'everyday-talk', situationId: 'remember-yesterday-illness', intentId: 'express-sympathy', replySpeaker: 'Νίκος',
    context: [
      { speaker: 'Νίκος', greek: 'Γιατί δεν ήρθε η Άννα στο μάθημα;', translation: 'Почему Анна не пришла на занятие?' },
      { speaker: 'Μαρία', greek: 'Η Άννα είναι άρρωστη. Έχει πυρετό.', translation: 'Анна болеет. У неё температура.' },
    ],
    options: [
      { id: 'wish', greek: 'Περαστικά της!', translation: 'Пусть она выздоравливает!', explanation: 'Это пожелание выздоровления Анне.' },
      { id: 'thanks', greek: 'Ευχαριστώ, είμαι καλά.', translation: 'Спасибо, я в порядке.', explanation: 'Это ответ о собственном самочувствии; Мария сообщила о болезни Анны.' },
      { id: 'question', greek: 'Περαστικά σου!', translation: 'Выздоравливай!', explanation: 'Обращено к Марии, хотя болеет Анна.' },
    ],
    correctOptionId: 'wish', explanation: 'Болеет Анна: пожелание относится к ней, поэтому используется της.',
  },
  {
    id: 'd-everyday-02', level: 'A1', categoryId: 'everyday-talk', situationId: 'where-pain-now', intentId: 'report-symptom', replySpeaker: 'Άννα',
    context: [
      { speaker: 'Γιατρός', greek: 'Σε πονάει ακόμα το στομάχι;', translation: 'У тебя всё ещё болит живот?' },
    ],
    options: [
      { id: 'head', greek: 'Όχι, τώρα με πονάει το κεφάλι.', translation: 'Нет, теперь у меня болит голова.', explanation: 'Отвечает врачу о самочувствии.' },
      { id: 'doctor', greek: 'Ναι, σας πονάει το στομάχι.', translation: 'Да, у вас болит живот.', explanation: 'Приписывает боль врачу вместо ответа о себе.' },
      { id: 'other', greek: 'Όχι, τώρα σε πονάει το κεφάλι.', translation: 'Нет, теперь у тебя болит голова.', explanation: 'Говорит о боли врача вместо самочувствия пациентки.' },
    ],
    correctOptionId: 'head', explanation: 'Врач спрашивает о пациентке; она отвечает о себе, используя με.',
  },
  {
    id: 'd-everyday-03', level: 'A2', categoryId: 'everyday-talk', situationId: 'meaning-of-bus-stop', intentId: 'accept-request', replySpeaker: 'Ελένη',
    context: [
      { speaker: 'Ελένη', greek: 'Πρέπει να κατεβούμε στην επόμενη στάση.', translation: 'Нам нужно выйти на следующей остановке.' },
      { speaker: 'Νίκος', greek: 'Δεν ξέρω πού είναι. Μπορείς να μου πεις πότε να κατέβω;', translation: 'Я не знаю, где она. Можешь сказать мне, когда выходить?' },
    ],
    options: [
      { id: 'help', greek: 'Ναι, θα σου πω.', translation: 'Да, я тебе скажу.', explanation: 'Принимает просьбу предупредить об остановке.' },
      { id: 'alone', greek: 'Ναι, θα κατέβω μόνη μου χωρίς να σου πω.', translation: 'Да, я выйду одна, не сказав тебе.', explanation: 'Не выполняет просьбу предупредить Никоса.' },
      { id: 'ticket', greek: 'Ναι, θα σου πω πόσο κάνει το εισιτήριο.', translation: 'Да, я скажу тебе, сколько стоит билет.', explanation: 'Обещает другую информацию вместо нужного предупреждения.' },
    ],
    correctOptionId: 'help', explanation: 'Никос просит предупредить, когда выходить; Элени соглашается помочь.',
  },
  {
    id: 'd-everyday-04', level: 'A2', categoryId: 'everyday-talk', situationId: 'bread-unavailable-at-shop', intentId: 'explain-unavailable-item', replySpeaker: 'Μαρία',
    context: [
      { speaker: 'Μαρία', greek: 'Πήγα στο κατάστημα για ψωμί. Ήταν ανοιχτό, αλλά το ράφι με το ψωμί ήταν άδειο.', translation: 'Я пошла в магазин за хлебом. Он был открыт, но полка с хлебом была пуста.' },
      { speaker: 'Άννα', greek: 'Και τι έγινε; Γιατί δεν πήρες ψωμί;', translation: 'И что случилось? Почему ты не взяла хлеб?' },
    ],
    options: [
      { id: 'store-closed', greek: 'Το κατάστημα ήταν ήδη κλειστό.', translation: 'Магазин уже был закрыт.', explanation: 'В контексте прямо сказано, что магазин был открыт.' },
      { id: 'bread', greek: 'Δεν υπήρχε πια ψωμί.', translation: 'Хлеба уже не было.', explanation: 'На полке с хлебом было пусто, поэтому Мария не смогла его купить.' },
      { id: 'apples', greek: 'Δεν υπήρχαν πια μήλα.', translation: 'Яблок уже не было.', explanation: 'Вопрос о хлебе; отсутствие яблок не объясняет ситуацию.' },
    ],
    correctOptionId: 'bread', explanation: 'Хлеба не было: полка с хлебом была пустой, хотя магазин работал.',
  },
  {
    id: 'd-everyday-05', level: 'A2', categoryId: 'everyday-talk', situationId: 'saturday-trip-to-mountains', intentId: 'repeat-missed-information', replySpeaker: 'Νίκος',
    context: [
      { speaker: 'Νίκος', greek: 'Το Σάββατο πήγαμε στο Τρόοδος και περπατήσαμε στο βουνό. Την Κυριακή μείναμε σπίτι.', translation: 'В субботу мы ездили в Троодос и гуляли в горах. В воскресенье остались дома.' },
      { speaker: 'Μαρία', greek: 'Συγγνώμη, δεν άκουσα καλά. Ποια μέρα πήγατε στο Τρόοδος;', translation: 'Извини, я не расслышала. В какой день вы ездили в Троодос?' },
    ],
    options: [
      { id: 'saturday', greek: 'Το Σάββατο.', translation: 'В субботу.', explanation: 'Никос сказал, что ездили в Троодос в субботу.' },
      { id: 'sunday', greek: 'Την Κυριακή.', translation: 'В воскресенье.', explanation: 'В воскресенье они, по словам Никоса, остались дома.' },
      { id: 'friday', greek: 'Την Παρασκευή.', translation: 'В пятницу.', explanation: 'О пятнице в разговоре ничего не сказано.' },
    ],
    correctOptionId: 'saturday', explanation: 'Нужно соотнести поездку в Троодос с субботой, а не с воскресеньем, проведённым дома.',
  },
  {
    id: 'd-everyday-06', level: 'A2', categoryId: 'everyday-talk', situationId: 'reason-carry-one-bag', intentId: 'accept-offer', replySpeaker: 'Άννα',
    context: [
      { speaker: 'Άννα', greek: 'Το χέρι μου πονάει και δεν μπορώ να κουβαλήσω δύο τσάντες.', translation: 'У меня болит рука, и я не могу нести две сумки.' },
      { speaker: 'Ελένη', greek: 'Να πάρω εγώ τη μία τσάντα;', translation: 'Давай я возьму одну сумку?' },
    ],
    options: [
      { id: 'help', greek: 'Ναι, ευχαριστώ. Πάρε αυτή, παρακαλώ.', translation: 'Да, спасибо. Возьми вот эту, пожалуйста.', explanation: 'Принимает предложенную помощь.' },
      { id: 'both', greek: 'Όχι, δώσε μου και τις δύο. Μπορώ να τις κουβαλήσω.', translation: 'Нет, дай мне обе. Я могу их нести.', explanation: 'Противоречит сказанному, что Анна не может нести две сумки.' },
      { id: 'pain', greek: 'Όχι, το χέρι μου δεν πονάει.', translation: 'Нет, моя рука не болит.', explanation: 'Отрицает только что названную боль.' },
    ],
    correctOptionId: 'help', explanation: 'Анна принимает помощь с одной из двух сумок.',
  },

  {
    id: 'd-place-01', level: 'A1', categoryId: 'places-travel', situationId: 'find-pharmacy', intentId: 'repeat-missed-information', replySpeaker: 'Νίκος',
    context: [
      { speaker: 'Νίκος', greek: 'Το φαρμακείο είναι δίπλα στην τράπεζα, στη γωνία.', translation: 'Аптека находится рядом с банком, на углу.' },
      { speaker: 'Μαρία', greek: 'Συγγνώμη, δεν άκουσα καλά. Πού είναι το φαρμακείο;', translation: 'Извини, я не расслышала. Где аптека?' },
    ],
    options: [
      { id: 'pharmacy', greek: 'Είναι δίπλα στην τράπεζα, στη γωνία.', translation: 'Она рядом с банком, на углу.', explanation: 'Это повторяет место, которое только что назвали.' },
      { id: 'opposite-bank', greek: 'Είναι απέναντι από την τράπεζα, στην πλατεία.', translation: 'Она напротив банка, на площади.', explanation: 'Это понятный ответ о месте, но Никос сказал, что аптека рядом с банком, на углу.' },
      { id: 'post-office', greek: 'Είναι δίπλα στο ταχυδρομείο, απέναντι από την αγορά.', translation: 'Она рядом с почтой, напротив рынка.', explanation: 'Это тоже указывает место, но оно не совпадает с тем, что сказал Никос.' },
    ],
    correctOptionId: 'pharmacy', explanation: 'Вопрос «πού είναι» спрашивает о местонахождении аптеки.',
  },
  {
    id: 'd-place-02', level: 'A2', categoryId: 'places-travel', situationId: 'confirm-left-after-bank', intentId: 'ask-for-clarification', replySpeaker: 'Εσύ',
    context: [
      { speaker: 'Νίκος', greek: 'Πηγαίνετε ευθεία μέχρι την τράπεζα.', translation: 'Идите прямо до банка.' },
      { speaker: 'Εσύ', greek: 'Και μετά;', translation: 'А потом?' },
      { speaker: 'Νίκος', greek: 'Μετά στρίβετε αριστερά.', translation: 'Потом повернёте налево.' },
    ],
    options: [
      { id: 'confirm', greek: 'Άρα στρίβω αριστερά μετά την τράπεζα, σωστά;', translation: 'Значит, после банка я поворачиваю налево, верно?', explanation: 'Это проверяет, правильно ли понято указание.' },
      { id: 'right', greek: 'Άρα στρίβω δεξιά μετά την τράπεζα, σωστά;', translation: 'Значит, после банка я поворачиваю направо, верно?', explanation: 'Никос сказал повернуть налево, а не направо.' },
      { id: 'straight', greek: 'Άρα συνεχίζω ευθεία μετά την τράπεζα, σωστά;', translation: 'Значит, после банка я продолжаю идти прямо, верно?', explanation: 'Никос сказал повернуть налево, а не продолжать идти прямо.' },
    ],
    correctOptionId: 'confirm', explanation: 'Никос уже назвал маршрут; уместно уточнить, что поворот налево будет после банка.',
  },
  {
    id: 'd-place-03', level: 'A2', categoryId: 'places-travel', situationId: 'bus-to-university-stops', intentId: 'repeat-missed-information', replySpeaker: 'Οδηγός',
    context: [
      { speaker: 'Επιβάτης', greek: 'Θέλω να πάω στο πανεπιστήμιο.', translation: 'Я хочу попасть в университет.' },
      { speaker: 'Οδηγός', greek: 'Κατεβείτε στην πέμπτη στάση μετά την πλατεία.', translation: 'Выходите на пятой остановке после площади.' },
      { speaker: 'Επιβάτης', greek: 'Συγγνώμη, σε ποια στάση είπατε;', translation: 'Извините, на какой остановке вы сказали?' },
    ],
    options: [
      { id: 'stop', greek: 'Στην πέμπτη στάση μετά την πλατεία.', translation: 'На пятой остановке после площади.', explanation: 'Это повторяет остановку, которую назвал водитель.' },
      { id: 'price', greek: 'Στη δεύτερη στάση πριν από την πλατεία.', translation: 'На второй остановке до площади.', explanation: 'Это другая остановка, а водитель назвал пятую после площади.' },
      { id: 'sixth-stop', greek: 'Στην έκτη στάση μετά την πλατεία.', translation: 'На шестой остановке после площади.', explanation: 'Водитель сказал выйти на пятой остановке, а не на шестой.' },
    ],
    correctOptionId: 'stop', explanation: 'Водитель подтвердил направление и назвал остановку; следующий полезный вопрос — где выходить.',
  },
  {
    id: 'd-place-04', level: 'A2', categoryId: 'places-travel', situationId: 'choose-return-ticket', intentId: 'request-return-ticket', replySpeaker: 'Εσύ',
    context: [
      { speaker: 'Υπάλληλος', greek: 'Θέλετε εισιτήριο απλής διαδρομής ή με επιστροφή;', translation: 'Вам билет в одну сторону или туда и обратно?' },
      { speaker: 'Εσύ', greek: 'Θέλω να πάω στη Λεμεσό και να γυρίσω αύριο.', translation: 'Я хочу поехать в Лимасол и вернуться завтра.' },
    ],
    options: [
      { id: 'return', greek: 'Ένα εισιτήριο με επιστροφή, παρακαλώ.', translation: 'Билет туда и обратно, пожалуйста.', explanation: 'Нужно уехать и вернуться, поэтому нужен билет с обратной поездкой.' },
      { id: 'single', greek: 'Ένα εισιτήριο απλής διαδρομής, παρακαλώ.', translation: 'Билет в одну сторону, пожалуйста.', explanation: 'Этот билет не включает поездку обратно.' },
      { id: 'wrong-destination', greek: 'Ένα εισιτήριο με επιστροφή για την Πάφο, παρακαλώ.', translation: 'Билет туда и обратно до Пафоса, пожалуйста.', explanation: 'Такой билет подходит по типу, но названный пункт назначения — Лимасол.' },
    ],
    correctOptionId: 'return', explanation: 'В реплике сказано, что поездка будет туда и обратно.',
  },
  {
    id: 'd-place-05', level: 'A2', categoryId: 'places-travel', situationId: 'bus-route-appointment-address', intentId: 'confirm-route-detail', replySpeaker: 'Μαρία',
    context: [
      { speaker: 'Μαρία', greek: 'Έχω ραντεβού στην οδό Αθηνάς 12. Ο χάρτης της άσκησης δείχνει τη γραμμή 3 στην οδό Κύπρου, όχι στην οδό Αθηνάς.', translation: 'У меня встреча на улице Афинас, 12. На карте в задании маршрут № 3 показан на улице Кипру, а не на улице Афинас.' },
      { speaker: 'Ελένη', greek: 'Τότε να ψάξουμε άλλη γραμμή για να πάμε στο ραντεβού σου;', translation: 'Тогда нам поискать другой маршрут, чтобы добраться до твоей встречи?' },
    ],
    options: [
      { id: 'route', greek: 'Ναι, καλύτερα να κοιτάξουμε άλλη γραμμή για την οδό Αθηνάς.', translation: 'Да, лучше нам посмотреть другой маршрут до улицы Афинас.', explanation: 'Подтверждает, что для улицы Афинас нужно проверить другой маршрут: на карте задания линия 3 проходит по улице Кипру.' },
      { id: 'appointment', greek: 'Το ραντεβού μου είναι αύριο το πρωί.', translation: 'Моя встреча завтра утром.', explanation: 'Сообщает время встречи, но не отвечает, стоит ли искать другой маршрут.' },
      { id: 'wrong-street', greek: 'Όχι, πάρε τη γραμμή 3 για την οδό Αθηνάς.', translation: 'Нет, поезжай на автобусе № 3 до улицы Афинас.', explanation: 'Не соответствует карте учебного задания: линия 3 показана на улице Кипру, а не на улице Афинас.' },
    ],
    correctOptionId: 'route', explanation: 'Мария советует искать другой маршрут, потому что на карте учебного задания линия 3 проходит по Кипру, а не по Афинас.',
  },
  {
    id: 'd-place-06', level: 'A2', categoryId: 'places-travel', situationId: 'hotel-elevator-location', intentId: 'acknowledge-hotel-directions', replySpeaker: 'Εσύ',
    context: [
      { speaker: 'Υπάλληλος', greek: 'Το δωμάτιό σας είναι στον τρίτο όροφο. Το ασανσέρ είναι δεξιά.', translation: 'Ваш номер на третьем этаже. Лифт справа.' },
    ],
    options: [
      { id: 'elevator', greek: 'Ευχαριστώ. Θα πάρω το ασανσέρ.', translation: 'Спасибо. Я воспользуюсь лифтом.', explanation: 'Это подходит к указанию, где находится лифт.' },
      { id: 'bus', greek: 'Ευχαριστώ. Θα πάρω το λεωφορείο.', translation: 'Спасибо. Я поеду на автобусе.', explanation: 'Для поездки на третий этаж автобус не подходит.' },
      { id: 'beach', greek: 'Ευχαριστώ. Θα πάω στην παραλία.', translation: 'Спасибо. Я пойду на пляж.', explanation: 'Сотрудник гостиницы говорит о номере и лифте, а не о пляже.' },
    ],
    correctOptionId: 'elevator', explanation: 'Сотрудник указал лифт, чтобы гость мог подняться на третий этаж.',
  },

  {
    id: 'd-time-01', level: 'A1', categoryId: 'plans-time', situationId: 'ask-current-time', intentId: 'agree-on-time', replySpeaker: 'Μαρία',
    context: [
      { speaker: 'Ελένη', greek: 'Η ταινία αρχίζει στις οκτώ. Να συναντηθούμε μισή ώρα πριν;', translation: 'Фильм начинается в восемь. Встретимся за полчаса до начала?' },
    ],
    options: [
      { id: 'half', greek: 'Ναι, στις επτά και μισή.', translation: 'Да, в половине восьмого.', explanation: 'Это за полчаса до восьми.' },
      { id: 'late', greek: 'Ναι, στις οκτώ και μισή.', translation: 'Да, в половине девятого.', explanation: 'Это через полчаса после начала.' },
      { id: 'hour', greek: 'Ναι, στις επτά.', translation: 'Да, в семь.', explanation: 'Это за час, а предложено за полчаса.' },
    ],
    correctOptionId: 'half', explanation: 'Мария подтверждает время встречи за полчаса до начала фильма.',
  },
  {
    id: 'd-time-02', level: 'A1', categoryId: 'plans-time', situationId: 'confirm-dentist-appointment', intentId: 'repeat-missed-information', replySpeaker: 'Ελένη',
    context: [
      { speaker: 'Ελένη', greek: 'Έγραψα στο ημερολόγιο το ραντεβού με τον οδοντίατρο: Πέμπτη, στις δέκα.', translation: 'Я записала встречу с зубным врачом в календарь: четверг, в десять.' },
      { speaker: 'Νίκος', greek: 'Συγγνώμη, δεν άκουσα την ώρα. Μπορείς να μου πεις ξανά πότε είναι το ραντεβού;', translation: 'Извини, я не расслышал время. Можешь ещё раз сказать, когда встреча?' },
    ],
    options: [
      { id: 'appointment', greek: 'Την Πέμπτη στις δέκα.', translation: 'В четверг в десять.', explanation: 'Это повторяет день и время из календаря.' },
      { id: 'friday', greek: 'Την Παρασκευή στις δέκα.', translation: 'В пятницу в десять.', explanation: 'День не совпадает: Елена записала встречу на четверг.' },
      { id: 'eleven', greek: 'Την Πέμπτη στις έντεκα.', translation: 'В четверг в одиннадцать.', explanation: 'Время не совпадает: Елена записала встречу на десять.' },
    ],
    correctOptionId: 'appointment', explanation: 'В календаре уже указано точное время — четверг, десять часов.',
  },
  {
    id: 'd-time-03', level: 'A2', categoryId: 'plans-time', situationId: 'move-meeting-after-work', intentId: 'agree-on-time', replySpeaker: 'Ελένη',
    context: [
      { speaker: 'Άννα', greek: 'Μπορούμε να συναντηθούμε αύριο στις έξι;', translation: 'Мы можем встретиться завтра в шесть?' },
      { speaker: 'Ελένη', greek: 'Στις έξι είμαι ακόμα στη δουλειά. Στις επτά μπορώ.', translation: 'В шесть я ещё буду на работе. В семь могу.' },
      { speaker: 'Άννα', greek: 'Τότε στις επτά;', translation: 'Тогда в семь?' },
    ],
    options: [
      { id: 'seven', greek: 'Ναι, στις επτά με βολεύει.', translation: 'Да, в семь мне удобно.', explanation: 'Елена уже сказала, что в семь она может.' },
      { id: 'six', greek: 'Ναι, στις έξι με βολεύει.', translation: 'Да, в шесть мне удобно.', explanation: 'В шесть Елена ещё на работе.' },
      { id: 'unavailable', greek: 'Όχι, αύριο δεν μπορώ καθόλου.', translation: 'Нет, завтра я совсем не могу.', explanation: 'Елена уже сказала, что завтра может встретиться в семь.' },
    ],
    correctOptionId: 'seven', explanation: 'Анна предлагает перенести встречу на семь; Елена уже сказала, что тогда свободна.',
  },
  {
    id: 'd-time-04', level: 'A2', categoryId: 'plans-time', situationId: 'choose-thursday-after-five', intentId: 'agree-on-time', replySpeaker: 'Νίκος',
    context: [
      { speaker: 'Νίκος', greek: 'Την Τετάρτη δουλεύω μέχρι αργά. Την Πέμπτη δουλεύω από το πρωί μέχρι τις πέντε και μετά είμαι ελεύθερος.', translation: 'В среду я работаю допоздна. В четверг я работаю с утра до пяти, а потом свободен.' },
      { speaker: 'Μαρία', greek: 'Πότε μπορούμε να πάμε για καφέ;', translation: 'Когда мы можем сходить на кофе?' },
    ],
    options: [
      { id: 'thursday', greek: 'Την Πέμπτη μετά τις πέντε.', translation: 'В четверг после пяти.', explanation: 'Это единственное названное Никосом свободное время.' },
      { id: 'wednesday', greek: 'Την Τετάρτη το βράδυ.', translation: 'В среду вечером.', explanation: 'В среду Никос работает допоздна.' },
      { id: 'morning', greek: 'Την Πέμπτη το πρωί.', translation: 'В четверг утром.', explanation: 'Никос сказал, что в четверг работает с утра до пяти.' },
    ],
    correctOptionId: 'thursday', explanation: 'Нужно выбрать время, когда Никос уже сказал, что свободен.',
  },
  {
    id: 'd-time-05', level: 'A2', categoryId: 'plans-time', situationId: 'airport-arrival-pickup', intentId: 'agree-on-time', replySpeaker: 'Άννα',
    context: [
      { speaker: 'Άννα', greek: 'Το αεροπλάνο μου φτάνει στη Λάρνακα την Παρασκευή στις οκτώ το βράδυ. Θέλω να φύγω από το αεροδρόμιο την ίδια μέρα, πριν από τις εννέα.', translation: 'Мой самолёт прибывает в Ларнаку в пятницу в восемь вечера. Я хочу уехать из аэропорта в тот же день, до девяти.' },
      { speaker: 'Νίκος', greek: 'Να έρθω να σε πάρω στις οκτώ και μισή;', translation: 'Приехать за тобой в половине девятого?' },
    ],
    options: [
      { id: 'arrival', greek: 'Ναι, στις οκτώ και μισή, σε παρακαλώ.', translation: 'Да, в половине девятого, пожалуйста.', explanation: 'Анна подтверждает предложенное время встречи.' },
      { id: 'too-soon', greek: 'Όχι, έλα στις οκτώ το πρωί.', translation: 'Нет, приезжай в восемь утра.', explanation: 'В восемь утра Анна ещё не прилетела; она просит забрать её после вечернего прилёта.' },
      { id: 'wrong-day', greek: 'Όχι, έλα το Σάββατο στις οκτώ και μισή.', translation: 'Нет, приезжай в субботу в половине девятого.', explanation: 'Суббота противоречит явной просьбе уехать из аэропорта в день прилёта.' },
    ],
    correctOptionId: 'arrival', explanation: 'Предложенные пятница, 20:30 соответствуют прилёту в 20:00 и просьбе уехать до 21:00 в тот же день.',
  },
  {
    id: 'd-time-06', level: 'A2', categoryId: 'plans-time', situationId: 'rain-plan-for-beach', intentId: 'ask-about-plan-change', replySpeaker: 'Ελένη',
    context: [
      { speaker: 'Ελένη', greek: 'Αύριο θέλουμε να πάμε στην παραλία. Αν βρέξει, μπορούμε να πάμε στο μουσείο.', translation: 'Завтра мы хотим пойти на пляж. Если будет дождь, можем пойти в музей.' },
      { speaker: 'Άννα', greek: 'Και αν έχει ήλιο;', translation: 'А если будет солнечно?' },
    ],
    options: [
      { id: 'beach', greek: 'Τότε θα πάμε στην παραλία.', translation: 'Тогда пойдём на пляж.', explanation: 'В исходном плане пляж выбран для хорошей погоды.' },
      { id: 'rain', greek: 'Τότε θα πάμε στο μουσείο.', translation: 'Тогда пойдём в музей.', explanation: 'Музей предложен на случай дождя.' },
      { id: 'work', greek: 'Τότε θα πάω στη δουλειά.', translation: 'Тогда пойду на работу.', explanation: 'Работа не упоминается в плане на завтра.' },
    ],
    correctOptionId: 'beach', explanation: 'В разговоре музей — запасной вариант на случай дождя, а пляж — основной план.',
  },

  {
    id: 'd-polite-01', level: 'A1', categoryId: 'politeness-requests', situationId: 'repeat-family-name', intentId: 'ask-for-clarification', replySpeaker: 'Εσύ',
    context: [
      { speaker: 'Υπάλληλος', greek: 'Το επώνυμό σας είναι Παπαδοπούλου;', translation: 'Ваша фамилия — Пападопулу?' },
      { speaker: 'Εσύ', greek: 'Συγγνώμη, δεν άκουσα καλά.', translation: 'Извините, я не расслышал.' },
    ],
    options: [
      { id: 'repeat', greek: 'Μπορείτε να το επαναλάβετε, παρακαλώ;', translation: 'Не могли бы вы повторить, пожалуйста?', explanation: 'Это вежливо просит сотрудника повторить фамилию.' },
      { id: 'address', greek: 'Πού είναι η στάση του λεωφορείου;', translation: 'Где автобусная остановка?', explanation: 'Это вопрос о дороге, а не просьба повторить фамилию.' },
      { id: 'thanks', greek: 'Ευχαριστώ για το εισιτήριο.', translation: 'Спасибо за билет.', explanation: 'В диалоге не было ни билета, ни просьбы о нём.' },
    ],
    correctOptionId: 'repeat', explanation: 'Ты не расслышал фамилию, поэтому просишь сотрудника повторить её.',
  },
  {
    id: 'd-polite-02', level: 'A1', categoryId: 'politeness-requests', situationId: 'decline-more-water', intentId: 'decline-offer', replySpeaker: 'Άννα',
    context: [
      { speaker: 'Σερβιτόρος', greek: 'Θέλετε να σας βάλω κι άλλο νερό;', translation: 'Хотите, я налью вам ещё воды?' },
    ],
    options: [
      { id: 'decline', greek: 'Όχι, ευχαριστώ. Το ποτήρι μου είναι ακόμα γεμάτο.', translation: 'Нет, спасибо. Мой стакан ещё полный.', explanation: 'Вежливо отказывается от добавки и объясняет причину.' },
      { id: 'wrong-owner', greek: 'Όχι, ευχαριστώ. Το ποτήρι σας είναι ακόμα γεμάτο.', translation: 'Нет, спасибо. Ваш стакан ещё полный.', explanation: 'Говорит о стакане официанта вместо своего.' },
      { id: 'serve', greek: 'Ναι, να σας βάλω κι άλλο νερό;', translation: 'Да, налить вам ещё воды?', explanation: 'Меняет роли: посетитель предлагает обслужить официанта вместо ответа на предложение.' },
    ],
    correctOptionId: 'decline', explanation: 'Анна отвечает на предложение официанта и объясняет отказ состоянием своего стакана.',
  },
  {
    id: 'd-polite-03', level: 'A2', categoryId: 'politeness-requests', situationId: 'explain-return-ticket', intentId: 'confirm-arrangement', replySpeaker: 'Νίκος',
    context: [
      { speaker: 'Άννα', greek: 'Θα γυρίσουμε αύριο. Αγόρασες εισιτήρια και για την επιστροφή;', translation: 'Мы вернёмся завтра. Ты купил билеты и на обратную дорогу?' },
    ],
    options: [
      { id: 'return', greek: 'Ναι, στον σταθμό αγόρασα εισιτήρια με επιστροφή.', translation: 'Да, на вокзале я купил билеты туда и обратно.', explanation: 'Подтверждает покупку билетов с обратной поездкой.' },
      { id: 'single', greek: 'Ναι, αγόρασα εισιτήρια μόνο για να πάμε.', translation: 'Да, я купил билеты только туда.', explanation: 'Утвердительное подтверждение обратной поездки противоречит «только туда».' },
      { id: 'tomorrow', greek: 'Ναι, θα τα αγοράσω αύριο.', translation: 'Да, я куплю их завтра.', explanation: '«Да» подтверждает уже совершённую покупку, но продолжение говорит о будущей.' },
    ],
    correctOptionId: 'return', explanation: 'Анна проверяет, куплены ли билеты на обратную дорогу; Никос подтверждает покупку.',
  },
  {
    id: 'd-polite-04', level: 'A2', categoryId: 'politeness-requests', situationId: 'suggest-sunday-instead', intentId: 'agree-on-time', replySpeaker: 'Άννα',
    context: [
      { speaker: 'Άννα', greek: 'Θέλεις να πάμε για καφέ το Σάββατο;', translation: 'Хочешь сходить на кофе в субботу?' },
      { speaker: 'Ελένη', greek: 'Το Σάββατο δουλεύω, αλλά την Κυριακή είμαι ελεύθερη.', translation: 'В субботу я работаю, но в воскресенье свободна.' },
    ],
    options: [
      { id: 'alternative', greek: 'Τότε ας πάμε την Κυριακή.', translation: 'Тогда давай пойдём в воскресенье.', explanation: 'Принимает предложенный свободный день.' },
      { id: 'accept', greek: 'Ωραία, είσαι ελεύθερη το Σάββατο. Ας πάμε τότε.', translation: 'Отлично, ты свободна в субботу. Давай пойдём тогда.', explanation: 'Элени сказала, что в субботу работает.' },
      { id: 'unavailable-weekend', greek: 'Την Κυριακή δουλεύεις όλη μέρα, οπότε δεν μπορούμε.', translation: 'В воскресенье ты работаешь весь день, так что мы не можем.', explanation: 'Элени сказала, что в воскресенье свободна.' },
    ],
    correctOptionId: 'alternative', explanation: 'Анна предложила субботу, Элени назвала свободное воскресенье, и Анна принимает этот день.',
  },
  {
    id: 'd-polite-05', level: 'A2', categoryId: 'politeness-requests', situationId: 'try-shoes-size-39', intentId: 'accept-offer', replySpeaker: 'Εσύ',
    context: [
      { speaker: 'Εσύ', greek: 'Δοκίμασα το 38 και είναι μικρό. Θέλω να δοκιμάσω μόνο το 39. Μου αρέσουν αυτά τα παπούτσια.', translation: 'Я примерил 38-й размер, и он мал. Хочу примерить только 39-й. Мне нравится эта обувь.' },
      { speaker: 'Πωλητής', greek: 'Αυτά είναι νούμερο 38. Να σας φέρω νούμερο 39 για να τα δοκιμάσετε;', translation: 'Это 38-й размер. Принести 39-й, чтобы вы их примерили?' },
    ],
    options: [
      { id: 'try', greek: 'Ναι, παρακαλώ. Θα ήθελα να τα δοκιμάσω.', translation: 'Да, пожалуйста. Я бы хотел их примерить.', explanation: 'Это принимает предложение принести нужный размер и просит примерить.' },
      { id: 'wrong-size', greek: 'Ναι, παρακαλώ. Θα ήθελα να δοκιμάσω το 38.', translation: 'Да, пожалуйста. Я бы хотел примерить 38-й размер.', explanation: 'Покупатель уже примерил 38-й, назвал его маленьким и прямо попросил только 39-й.' },
      { id: 'not-these', greek: 'Όχι, ευχαριστώ. Δεν μου αρέσουν αυτά τα παπούτσια.', translation: 'Нет, спасибо. Мне не нравится эта обувь.', explanation: 'Покупатель только что сказал, что ему нравится эта обувь.' },
    ],
    correctOptionId: 'try', explanation: 'Продавец предлагает принести именно 39-й размер для примерки.',
  },
  {
    id: 'd-polite-06', level: 'A2', categoryId: 'politeness-requests', situationId: 'ask-where-to-write-surname', intentId: 'ask-for-clarification', replySpeaker: 'Εσύ',
    context: [
      { speaker: 'Υπάλληλος', greek: 'Στη φόρμα, «επώνυμο» σημαίνει το οικογενειακό σας όνομα.', translation: 'В анкете «επώνυμο» означает вашу фамилию.' },
      { speaker: 'Εσύ', greek: 'Ευχαριστώ. Δεν βλέπω πού πρέπει να το γράψω.', translation: 'Спасибо. Я не вижу, где нужно это написать.' },
    ],
    options: [
      { id: 'field', greek: 'Μπορείτε να μου δείξετε πού γράφω το επώνυμο;', translation: 'Не могли бы вы показать, где писать фамилию?', explanation: 'Это вежливо просит показать нужное поле анкеты.' },
      { id: 'first-name', greek: 'Μπορείτε να μου δείξετε πού γράφω το μικρό μου όνομα;', translation: 'Не могли бы вы показать, где писать моё имя?', explanation: 'Речь шла о фамилии, а это спрашивает про имя.' },
      { id: 'city', greek: 'Εδώ γράφω την πόλη μου;', translation: 'Здесь писать мой город?', explanation: 'Это уточняет другое поле анкеты, а не поле для фамилии.' },
    ],
    correctOptionId: 'field', explanation: 'Сотрудник объяснил слово в анкете; теперь нужно уточнить, где вписать фамилию.',
  },
  {
    id: 'd-everyday-07', level: 'A1', categoryId: 'everyday-talk', situationId: 'kiosk-small-change', intentId: 'respond-to-change-request', replySpeaker: 'Πελάτης',
    context: [
      { speaker: 'Πελάτης', greek: 'Ένα πακέτο τσιγάρα, παρακαλώ. Έχω πέντε ευρώ.', translation: 'Пачку сигарет, пожалуйста. У меня есть пять евро.' },
      { speaker: 'Περιπτεράς', greek: 'Το πακέτο κάνει δύο ευρώ. Δεν έχω ρέστα για πέντε ευρώ. Μήπως έχετε ψιλά;', translation: 'Пачка стоит 2 евро. У меня нет сдачи с 5 евро. У вас случайно есть мелочь?' },
    ],
    options: [
      { id: 'two-euro-cash', greek: 'Ναι, έχω δύο ευρώ. Ορίστε.', translation: 'Да, у меня есть два евро. Вот, пожалуйста.', explanation: 'Покупатель отвечает, что у него есть нужная сумма, и предлагает её продавцу.' },
      { id: 'change-reversed', greek: 'Ναι, ορίστε τα ρέστα σας.', translation: 'Да, вот ваша сдача.', explanation: 'Сдачу отдаёт продавец покупателю; здесь покупатель отвечает продавцу.' },
      { id: 'repeat-price', greek: 'Πόσο κάνει το πακέτο;', translation: 'Сколько стоит пачка?', explanation: 'Продавец уже назвал цену; вопрос не отвечает, есть ли у покупателя мелочь.' },
    ],
    correctOptionId: 'two-euro-cash', explanation: 'Продавец спрашивает о мелочи, а покупатель отвечает, что у него есть 2 евро, и предлагает их.',
  },
]
