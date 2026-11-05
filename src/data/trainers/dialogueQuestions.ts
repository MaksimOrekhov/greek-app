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
    id: 'd-intro-01', level: 'A1', categoryId: 'introductions', situationId: 'first-meeting-name', intentId: 'give-name',
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
    id: 'd-intro-02', level: 'A1', categoryId: 'introductions', situationId: 'meet-new-colleague', intentId: 'respond-to-introduction',
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
    id: 'd-intro-03', level: 'A1', categoryId: 'introductions', situationId: 'exam-good-luck', intentId: 'thank-for-wish',
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
    id: 'd-intro-04', level: 'A1', categoryId: 'introductions', situationId: 'welcome-new-student', intentId: 'respond-to-welcome',
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
    id: 'd-intro-05', level: 'A2', categoryId: 'introductions', situationId: 'how-met-maria', intentId: 'explain-how-people-met',
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
    id: 'd-intro-06', level: 'A2', categoryId: 'introductions', situationId: 'years-in-paphos', intentId: 'state-how-long-lived-somewhere',
    context: [
      { speaker: 'Άννα', greek: 'Από το 2023 ζω στην Πάφο. Πριν έμενα στη Λεμεσό.', translation: 'С 2023 года я живу в Пафосе. Раньше я жила в Лимасоле.' },
      { speaker: 'Νίκος', greek: 'Πόσο καιρό μένεις στην Πάφο;', translation: 'Как давно ты живёшь в Пафосе?' },
    ],
    options: [
      { id: 'duration', greek: 'Από το 2023.', translation: 'С 2023 года.', explanation: 'Это отвечает, как давно Анна живёт в Пафосе.' },
      { id: 'previous-city', greek: 'Πριν έμενα στη Λεμεσό.', translation: 'Раньше я жила в Лимасоле.', explanation: 'Это повторяет, где Анна жила раньше.' },
      { id: 'nationality', greek: 'Είμαι από την Ελλάδα.', translation: 'Я из Греции.', explanation: 'Это сообщает, откуда Анна родом.' },
    ],
    correctOptionId: 'duration', explanation: 'В предыдущей реплике Анна сказала, что переехала в Пафос в 2023 году.',
  },

  {
    id: 'd-self-01', level: 'A1', categoryId: 'about-yourself', situationId: 'new-student-occupation', intentId: 'say-what-you-study',
    context: [
      { speaker: 'Μαρία', greek: 'Τι σπουδάζεις στο πανεπιστήμιο;', translation: 'Что ты изучаешь в университете?' },
    ],
    options: [
      { id: 'study', greek: 'Σπουδάζω ιατρική.', translation: 'Я изучаю медицину.', explanation: 'Это называет предмет учёбы.' },
      { id: 'home', greek: 'Μένω κοντά στο πανεπιστήμιο.', translation: 'Я живу недалеко от университета.', explanation: 'Это говорит, где ты живёшь, а не чем занимаешься.' },
      { id: 'family', greek: 'Η αδελφή μου είναι γιατρός.', translation: 'Моя сестра — врач.', explanation: 'Это рассказывает о сестре, а не о тебе.' },
    ],
    correctOptionId: 'study', explanation: 'Мария спрашивает о занятии или работе; учёба в университете отвечает на вопрос.',
  },
  {
    id: 'd-self-02', level: 'A1', categoryId: 'about-yourself', situationId: 'siblings-question', intentId: 'talk-about-siblings',
    context: [
      { speaker: 'Εσύ', greek: 'Έχω έναν αδελφό και μία αδελφή.', translation: 'У меня есть брат и сестра.' },
      { speaker: 'Νίκος', greek: 'Πόσα αδέλφια έχεις;', translation: 'Сколько у тебя братьев и сестёр?' },
    ],
    options: [
      { id: 'siblings', greek: 'Έχω δύο αδέλφια: έναν αδελφό και μία αδελφή.', translation: 'У меня двое: брат и сестра.', explanation: 'Это называет обоих братьев и сестёр, которых упомянули в разговоре.' },
      { id: 'one-brother', greek: 'Έχω μόνο έναν αδελφό.', translation: 'У меня только один брат.', explanation: 'В разговоре ты также назвал сестру.' },
      { id: 'only-child', greek: 'Είμαι μοναχοπαίδι.', translation: 'Я единственный ребёнок в семье.', explanation: 'Это противоречит сказанному о брате и сестре.' },
    ],
    correctOptionId: 'siblings', explanation: 'Вопрос «Έχεις αδέλφια;» — о братьях и сёстрах.',
  },
  {
    id: 'd-self-03', level: 'A2', categoryId: 'about-yourself', situationId: 'sisters-job', intentId: 'describe-family-member-job',
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
    id: 'd-self-04', level: 'A2', categoryId: 'about-yourself', situationId: 'hotel-work-duties', intentId: 'describe-work-duties',
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
    id: 'd-self-05', level: 'A2', categoryId: 'about-yourself', situationId: 'usual-weekend-market', intentId: 'describe-weekend-routine',
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
    id: 'd-self-06', level: 'A2', categoryId: 'about-yourself', situationId: 'practice-greek-with-neighbours', intentId: 'confirm-language-practice-routine',
    context: [
      { speaker: 'Μαρία', greek: 'Θέλω να βελτιώσω τα ελληνικά μου. Οι γείτονές μου μιλούν ελληνικά.', translation: 'Я хочу улучшить свой греческий. Мои соседи говорят по-гречески.' },
      { speaker: 'Νίκος', greek: 'Τι κάνεις μαζί τους για να βελτιώσεις τα ελληνικά σου;', translation: 'Что ты делаешь вместе с ними, чтобы улучшать свой греческий?' },
    ],
    options: [
      { id: 'practice', greek: 'Μιλάω μαζί τους κάθε απόγευμα.', translation: 'Я говорю с ними каждый вечер.', explanation: 'Соседи говорят по-гречески, поэтому разговор с ними помогает Марии практиковаться.' },
      { id: 'work', greek: 'Διαβάζω ένα βιβλίο κάθε απόγευμα.', translation: 'Я читаю книгу каждый вечер.', explanation: 'Это может быть занятием, но не отвечает, как Мария общается с грекоязычными соседями.' },
      { id: 'travel', greek: 'Πηγαίνω στην Ελλάδα κάθε καλοκαίρι.', translation: 'Я езжу в Грецию каждое лето.', explanation: 'Это говорит о поездках.' },
    ],
    correctOptionId: 'practice', explanation: 'Мария уже сказала, что каждый день видит грекоязычных соседей; Никос уточняет, разговаривают ли они.',
  },

  {
    id: 'd-everyday-01', level: 'A1', categoryId: 'everyday-talk', situationId: 'remember-yesterday-illness', intentId: 'recall-symptom',
    context: [
      { speaker: 'Νίκος', greek: 'Η Άννα δεν ήρθε χθες στο μάθημα. Ξέρεις γιατί;', translation: 'Анна вчера не пришла на урок. Ты знаешь почему?' },
      { speaker: 'Μαρία', greek: 'Είχε πυρετό.', translation: 'У неё была температура.' },
      { speaker: 'Νίκος', greek: 'Τι είχε;', translation: 'Что у неё было?' },
    ],
    options: [
      { id: 'fever', greek: 'Είχε πυρετό.', translation: 'У неё была температура.', explanation: 'Мария только что сказала, что у Анны была температура.' },
      { id: 'cough', greek: 'Είχε βήχα.', translation: 'У неё был кашель.', explanation: 'В разговоре назвали температуру, а не кашель.' },
      { id: 'headache', greek: 'Είχε πονοκέφαλο.', translation: 'У неё болела голова.', explanation: 'В разговоре назвали температуру, а не головную боль.' },
    ],
    correctOptionId: 'fever', explanation: 'Нужно вспомнить, что Мария сказала о причине отсутствия Анны.',
  },
  {
    id: 'd-everyday-02', level: 'A1', categoryId: 'everyday-talk', situationId: 'where-pain-now', intentId: 'name-current-pain',
    context: [
      { speaker: 'Γιατρός', greek: 'Σε πονάει ακόμα το στομάχι;', translation: 'У тебя всё ещё болит живот?' },
      { speaker: 'Άννα', greek: 'Όχι. Τώρα με πονάει το κεφάλι.', translation: 'Нет. Теперь у меня болит голова.' },
      { speaker: 'Γιατρός', greek: 'Πού πονάς τώρα;', translation: 'Где у тебя теперь болит?' },
    ],
    options: [
      { id: 'head', greek: 'Στο κεφάλι.', translation: 'Голова.', explanation: 'Анна только что сказала, что теперь болит голова.' },
      { id: 'stomach', greek: 'Στο στομάχι.', translation: 'Живот.', explanation: 'Живот болел раньше, но теперь она сказала о голове.' },
      { id: 'arm', greek: 'Στο χέρι.', translation: 'В руке.', explanation: 'Это тоже часть тела, но Анна сказала, что теперь болит голова.' },
    ],
    correctOptionId: 'head', explanation: 'В коротком диалоге важно заметить, что боль переместилась с живота на голову.',
  },
  {
    id: 'd-everyday-03', level: 'A2', categoryId: 'everyday-talk', situationId: 'meaning-of-bus-stop', intentId: 'explain-word-in-context',
    context: [
      { speaker: 'Ελένη', greek: 'Ο οδηγός είπε «κατεβαίνουμε στην επόμενη στάση».', translation: 'Водитель сказал: «Мы выходим на следующей остановке».' },
      { speaker: 'Νίκος', greek: 'Τι σημαίνει «στάση» εδώ;', translation: 'Что здесь значит «στάση»?' },
    ],
    options: [
      { id: 'stop', greek: 'Είναι το σημείο όπου σταματά το λεωφορείο.', translation: 'Это место, где останавливается автобус.', explanation: 'В этом разговоре речь о месте, где пассажиры ждут автобус.' },
      { id: 'driver', greek: 'Είναι το άτομο που οδηγεί το λεωφορείο.', translation: 'Это человек, который ведёт автобус.', explanation: 'Это водитель, а не место остановки.' },
      { id: 'ticket', greek: 'Είναι το χαρτί που αγοράζουμε για τη διαδρομή.', translation: 'Это бумажка, которую мы покупаем для поездки.', explanation: 'Это билет, а вопрос о месте, где автобус останавливается.' },
    ],
    correctOptionId: 'stop', explanation: 'Слово «στάση» здесь относится к остановке автобуса, а не к водителю или билету.',
  },
  {
    id: 'd-everyday-04', level: 'A2', categoryId: 'everyday-talk', situationId: 'missed-shop-closing', intentId: 'explain-missed-shopping',
    context: [
      { speaker: 'Μαρία', greek: 'Το κατάστημα ήταν ανοιχτό μέχρι τις εννέα, αλλά όταν έφτασα στις οκτώ και τέταρτο δεν υπήρχε πια ψωμί.', translation: 'Магазин был открыт до девяти, но когда я пришла в четверть девятого, хлеба уже не было.' },
      { speaker: 'Άννα', greek: 'Γιατί δεν αγόρασες ψωμί;', translation: 'Почему ты не купила хлеб?' },
    ],
    options: [
      { id: 'store-closed', greek: 'Το κατάστημα ήταν ήδη κλειστό.', translation: 'Магазин уже был закрыт.', explanation: 'Магазин оставался открытым до девяти, поэтому это не объясняет, почему хлеб купить не удалось.' },
      { id: 'bread', greek: 'Δεν υπήρχε πια ψωμί.', translation: 'Хлеба уже не было.', explanation: 'Это прямо повторяет, что Мария сказала о хлебе.' },
      { id: 'apples', greek: 'Δεν υπήρχαν πια μήλα.', translation: 'Яблок уже не было.', explanation: 'Это могло бы быть о другом товаре, но Мария сказала, что закончился хлеб.' },
    ],
    correctOptionId: 'bread', explanation: 'Мария пришла до закрытия магазина, но в контексте сказано, что хлеб уже закончился.',
  },
  {
    id: 'd-everyday-05', level: 'A2', categoryId: 'everyday-talk', situationId: 'saturday-trip-to-mountains', intentId: 'recall-day-of-trip',
    context: [
      { speaker: 'Νίκος', greek: 'Το Σάββατο πήγαμε στο Τρόοδος και περπατήσαμε στο βουνό. Την Κυριακή μείναμε σπίτι.', translation: 'В субботу мы ездили в Троодос и гуляли в горах. В воскресенье остались дома.' },
      { speaker: 'Μαρία', greek: 'Πότε πήγατε στο Τρόοδος;', translation: 'Когда вы ездили в Троодос?' },
    ],
    options: [
      { id: 'saturday', greek: 'Το Σάββατο.', translation: 'В субботу.', explanation: 'Никос сказал, что ездили в Троодос в субботу.' },
      { id: 'sunday', greek: 'Την Κυριακή.', translation: 'В воскресенье.', explanation: 'В воскресенье они, по словам Никоса, остались дома.' },
      { id: 'friday', greek: 'Την Παρασκευή.', translation: 'В пятницу.', explanation: 'О пятнице в разговоре ничего не сказано.' },
    ],
    correctOptionId: 'saturday', explanation: 'Нужно соотнести поездку в Троодос с субботой, а не с воскресеньем, проведённым дома.',
  },
  {
    id: 'd-everyday-06', level: 'A2', categoryId: 'everyday-talk', situationId: 'reason-carry-one-bag', intentId: 'explain-physical-limitation',
    context: [
      { speaker: 'Άννα', greek: 'Το χέρι μου πονάει και δεν μπορώ να κουβαλήσω δύο τσάντες.', translation: 'У меня болит рука, и я не могу нести две сумки.' },
      { speaker: 'Ελένη', greek: 'Γιατί παίρνεις μόνο τη μία τσάντα;', translation: 'Почему ты берёшь только одну сумку?' },
    ],
    options: [
      { id: 'arm', greek: 'Γιατί πονάει το χέρι μου.', translation: 'Потому что у меня болит рука.', explanation: 'Это объясняет, почему Анна может нести только одну сумку.' },
      { id: 'color', greek: 'Γιατί η τσάντα είναι μπλε.', translation: 'Потому что сумка синяя.', explanation: 'Цвет не объясняет, почему она берёт только одну сумку.' },
      { id: 'shop', greek: 'Γιατί το κατάστημα είναι κλειστό.', translation: 'Потому что магазин закрыт.', explanation: 'Закрытый магазин не связан с тем, сколько сумок Анна может нести.' },
    ],
    correctOptionId: 'arm', explanation: 'Предыдущая реплика прямо объясняет, почему Анна не может нести две сумки.',
  },

  {
    id: 'd-place-01', level: 'A1', categoryId: 'places-travel', situationId: 'find-pharmacy', intentId: 'locate-a-place',
    context: [
      { speaker: 'Νίκος', greek: 'Το φαρμακείο είναι δίπλα στην τράπεζα, στη γωνία.', translation: 'Аптека находится рядом с банком, на углу.' },
      { speaker: 'Μαρία', greek: 'Πού είπες ότι είναι το φαρμακείο;', translation: 'Где ты сказал находится аптека?' },
    ],
    options: [
      { id: 'pharmacy', greek: 'Είναι δίπλα στην τράπεζα, στη γωνία.', translation: 'Она рядом с банком, на углу.', explanation: 'Это повторяет место, которое только что назвали.' },
      { id: 'opposite-bank', greek: 'Είναι απέναντι από την τράπεζα, στην πλατεία.', translation: 'Она напротив банка, на площади.', explanation: 'Это понятный ответ о месте, но Никос сказал, что аптека рядом с банком, на углу.' },
      { id: 'post-office', greek: 'Είναι δίπλα στο ταχυδρομείο, απέναντι από την αγορά.', translation: 'Она рядом с почтой, напротив рынка.', explanation: 'Это тоже указывает место, но оно не совпадает с тем, что сказал Никос.' },
    ],
    correctOptionId: 'pharmacy', explanation: 'Вопрос «πού είναι» спрашивает о местонахождении аптеки.',
  },
  {
    id: 'd-place-02', level: 'A2', categoryId: 'places-travel', situationId: 'confirm-left-after-bank', intentId: 'confirm-route-step',
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
    id: 'd-place-03', level: 'A2', categoryId: 'places-travel', situationId: 'bus-to-university-stops', intentId: 'ask-where-to-get-off',
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
    id: 'd-place-04', level: 'A2', categoryId: 'places-travel', situationId: 'choose-return-ticket', intentId: 'request-return-ticket',
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
    id: 'd-place-05', level: 'A2', categoryId: 'places-travel', situationId: 'bus-route-appointment-address', intentId: 'check-bus-route-to-address',
    context: [
      { speaker: 'Μαρία', greek: 'Έχω ραντεβού στην οδό Αθηνάς 12. Στον χάρτη η γραμμή 3 περνάει από την οδό Κύπρου, όχι από την οδό Αθηνάς.', translation: 'У меня встреча по адресу: улица Афинас, 12. На карте маршрут № 3 проходит по улице Кипру, а не по улице Афинас.' },
      { speaker: 'Ελένη', greek: 'Περνάει το λεωφορείο 3 από την οδό Αθηνάς;', translation: 'Автобус № 3 проходит по улице Афинас?' },
    ],
    options: [
      { id: 'route', greek: 'Όχι, περνάει από την οδό Κύπρου.', translation: 'Нет, он проходит по улице Кипру.', explanation: 'Это отвечает о маршруте, указанном на карте.' },
      { id: 'appointment', greek: 'Το ραντεβού μου είναι στις δώδεκα.', translation: 'Моя встреча в двенадцать.', explanation: 'Это сообщает время встречи, а не отвечает, где проходит автобус.' },
      { id: 'map', greek: 'Ο χάρτης είναι πάνω στο τραπέζι.', translation: 'Карта лежит на столе.', explanation: 'Это говорит, где лежит карта, а не что на ней показано.' },
    ],
    correctOptionId: 'route', explanation: 'Карта показывает автобус № 3 на улице Кипру, а не на улице Афинас.',
  },
  {
    id: 'd-place-06', level: 'A2', categoryId: 'places-travel', situationId: 'hotel-elevator-location', intentId: 'acknowledge-hotel-directions',
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
    id: 'd-time-01', level: 'A1', categoryId: 'plans-time', situationId: 'ask-current-time', intentId: 'tell-clock-time',
    context: [
      { speaker: 'Ελένη', greek: 'Η ταινία αρχίζει στις οκτώ.', translation: 'Фильм начинается в восемь.' },
      { speaker: 'Μαρία', greek: 'Τι ώρα αρχίζει η ταινία;', translation: 'Во сколько начинается фильм?' },
    ],
    options: [
      { id: 'eight', greek: 'Στις οκτώ.', translation: 'В восемь.', explanation: 'Елена сказала, что фильм начинается в восемь.' },
      { id: 'nine', greek: 'Στις εννέα.', translation: 'В девять.', explanation: 'В разговоре назвали восемь, а не девять.' },
      { id: 'seven', greek: 'Στις επτά.', translation: 'В семь.', explanation: 'В разговоре назвали восемь, а не семь.' },
    ],
    correctOptionId: 'eight', explanation: 'Мария спрашивает, во сколько начинается фильм.',
  },
  {
    id: 'd-time-02', level: 'A1', categoryId: 'plans-time', situationId: 'confirm-dentist-appointment', intentId: 'repeat-appointment-day-time',
    context: [
      { speaker: 'Ελένη', greek: 'Έγραψα στο ημερολόγιο το ραντεβού με τον οδοντίατρο: Πέμπτη, στις δέκα.', translation: 'Я записала встречу с зубным врачом в календарь: четверг, в десять.' },
      { speaker: 'Νίκος', greek: 'Πότε είναι το ραντεβού;', translation: 'Когда встреча?' },
    ],
    options: [
      { id: 'appointment', greek: 'Την Πέμπτη στις δέκα.', translation: 'В четверг в десять.', explanation: 'Это повторяет день и время из календаря.' },
      { id: 'friday', greek: 'Την Παρασκευή στις δέκα.', translation: 'В пятницу в десять.', explanation: 'День не совпадает: Елена записала встречу на четверг.' },
      { id: 'eleven', greek: 'Την Πέμπτη στις έντεκα.', translation: 'В четверг в одиннадцать.', explanation: 'Время не совпадает: Елена записала встречу на десять.' },
    ],
    correctOptionId: 'appointment', explanation: 'В календаре уже указано точное время — четверг, десять часов.',
  },
  {
    id: 'd-time-03', level: 'A2', categoryId: 'plans-time', situationId: 'move-meeting-after-work', intentId: 'reschedule-meeting-time',
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
    id: 'd-time-04', level: 'A2', categoryId: 'plans-time', situationId: 'choose-thursday-after-five', intentId: 'agree-on-free-day',
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
    id: 'd-time-05', level: 'A2', categoryId: 'plans-time', situationId: 'airport-arrival-pickup', intentId: 'coordinate-arrival-time',
    context: [
      { speaker: 'Άννα', greek: 'Το αεροπλάνο μου φτάνει στη Λάρνακα την Παρασκευή στις οκτώ το βράδυ.', translation: 'Мой самолёт прибывает в Ларнаку в пятницу в восемь вечера.' },
      { speaker: 'Νίκος', greek: 'Να έρθω να σε πάρω στις οκτώ και μισή;', translation: 'Приехать за тобой в половине девятого?' },
    ],
    options: [
      { id: 'arrival', greek: 'Ναι, στις οκτώ και μισή, σε παρακαλώ.', translation: 'Да, в половине девятого, пожалуйста.', explanation: 'Анна подтверждает предложенное время встречи.' },
      { id: 'too-soon', greek: 'Όχι, έλα στις οκτώ το πρωί.', translation: 'Нет, приезжай в восемь утра.', explanation: 'Самолёт прибывает в пятницу вечером, а не утром.' },
      { id: 'wrong-day', greek: 'Όχι, έλα το Σάββατο στις οκτώ και μισή.', translation: 'Нет, приезжай в субботу в половине девятого.', explanation: 'Самолёт прибывает в пятницу, а не в субботу.' },
    ],
    correctOptionId: 'arrival', explanation: 'Никос предлагает встречу в половине девятого, чтобы Анна успела забрать багаж после прилёта в восемь.',
  },
  {
    id: 'd-time-06', level: 'A2', categoryId: 'plans-time', situationId: 'rain-plan-for-beach', intentId: 'ask-about-plan-change',
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
    id: 'd-polite-01', level: 'A1', categoryId: 'politeness-requests', situationId: 'repeat-family-name', intentId: 'ask-to-repeat-name',
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
    id: 'd-polite-02', level: 'A1', categoryId: 'politeness-requests', situationId: 'decline-more-water', intentId: 'explain-polite-decline',
    context: [
      { speaker: 'Σερβιτόρος', greek: 'Θέλετε άλλο νερό;', translation: 'Хотите ещё воды?' },
      { speaker: 'Άννα', greek: 'Όχι, ευχαριστώ. Το ποτήρι μου είναι ακόμα γεμάτο.', translation: 'Нет, спасибо. Мой стакан ещё полный.' },
      { speaker: 'Νίκος', greek: 'Γιατί δεν θέλει άλλο νερό;', translation: 'Почему она не хочет ещё воды?' },
    ],
    options: [
      { id: 'full', greek: 'Γιατί το ποτήρι της είναι ακόμα γεμάτο.', translation: 'Потому что её стакан ещё полный.', explanation: 'Анна сама назвала эту причину отказа.' },
      { id: 'empty', greek: 'Γιατί το ποτήρι της είναι άδειο.', translation: 'Потому что её стакан пустой.', explanation: 'Анна сказала, что стакан ещё полный.' },
      { id: 'wants-more', greek: 'Γιατί θέλει άλλο νερό.', translation: 'Потому что она хочет ещё воды.', explanation: 'Анна отказалась от воды и сказала, что стакан ещё полный.' },
    ],
    correctOptionId: 'full', explanation: 'Анна вежливо отказалась: она уже сказала, что её стакан полный.',
  },
  {
    id: 'd-polite-03', level: 'A2', categoryId: 'politeness-requests', situationId: 'explain-return-ticket', intentId: 'explain-transport-term',
    context: [
      { speaker: 'Νίκος', greek: 'Στο σταθμό αγόρασα εισιτήριο με επιστροφή.', translation: 'На вокзале я купил билет туда и обратно.' },
      { speaker: 'Άννα', greek: 'Τι σημαίνει «με επιστροφή»;', translation: 'Что означает «туда и обратно»?' },
    ],
    options: [
      { id: 'round-trip', greek: 'Σημαίνει ότι το εισιτήριο είναι για να πας και να γυρίσεις.', translation: 'Это значит, что билет включает поездку туда и обратно.', explanation: 'Это объясняет, что именно включает такой билет.' },
      { id: 'seat', greek: 'Σημαίνει ότι έχεις θέση κοντά στο παράθυρο.', translation: 'Это значит, что у тебя место у окна.', explanation: 'Это говорит о месте в транспорте, а не о типе билета.' },
      { id: 'station', greek: 'Σημαίνει ότι ο σταθμός είναι ανοιχτός.', translation: 'Это значит, что вокзал открыт.', explanation: 'Это говорит о часах работы вокзала.' },
    ],
    correctOptionId: 'round-trip', explanation: 'Анна спрашивает значение выражения; оно относится к поездке туда и обратно.',
  },
  {
    id: 'd-polite-04', level: 'A2', categoryId: 'politeness-requests', situationId: 'suggest-sunday-instead', intentId: 'decline-and-suggest-alternative-day',
    context: [
      { speaker: 'Ελένη', greek: 'Το Σάββατο δουλεύω, αλλά την Κυριακή είμαι ελεύθερη.', translation: 'В субботу я работаю, но в воскресенье свободна.' },
      { speaker: 'Άννα', greek: 'Θέλεις να πάμε για καφέ το Σάββατο;', translation: 'Хочешь сходить на кофе в субботу?' },
    ],
    options: [
      { id: 'alternative', greek: 'Το Σάββατο δεν μπορώ, αλλά την Κυριακή είμαι ελεύθερη.', translation: 'В субботу не могу, но в воскресенье свободна.', explanation: 'Это вежливо отказывает в предложенный день и предлагает свободный день.' },
      { id: 'accept', greek: 'Ναι, το Σάββατο μπορώ όλη μέρα.', translation: 'Да, в субботу я могу весь день.', explanation: 'Элени сказала, что в субботу работает.' },
      { id: 'unavailable-weekend', greek: 'Το Σάββατο δεν μπορώ και την Κυριακή δουλεύω.', translation: 'В субботу я не могу, и в воскресенье работаю.', explanation: 'Элени сказала, что в воскресенье свободна.' },
    ],
    correctOptionId: 'alternative', explanation: 'Элени уже назвала субботу рабочим днём, а воскресенье — свободным.',
  },
  {
    id: 'd-polite-05', level: 'A2', categoryId: 'politeness-requests', situationId: 'try-shoes-size-39', intentId: 'accept-offer-and-ask-to-try',
    context: [
      { speaker: 'Εσύ', greek: 'Ψάχνω παπούτσια, νούμερο 39. Μου αρέσουν αυτά.', translation: 'Я ищу обувь, размер 39. Мне нравятся вот эти.' },
      { speaker: 'Πωλητής', greek: 'Αυτά είναι νούμερο 38. Να σας φέρω νούμερο 39 για να τα δοκιμάσετε;', translation: 'Это 38-й размер. Принести 39-й, чтобы вы их примерили?' },
    ],
    options: [
      { id: 'try', greek: 'Ναι, παρακαλώ. Θα ήθελα να τα δοκιμάσω.', translation: 'Да, пожалуйста. Я бы хотел их примерить.', explanation: 'Это принимает предложение принести нужный размер и просит примерить.' },
      { id: 'wrong-size', greek: 'Ναι, παρακαλώ. Θα ήθελα να δοκιμάσω το 38.', translation: 'Да, пожалуйста. Я бы хотел примерить 38-й размер.', explanation: 'Покупатель просил 39-й размер, а продавец предложил принести 39-й.' },
      { id: 'not-these', greek: 'Όχι, ευχαριστώ. Δεν μου αρέσουν αυτά τα παπούτσια.', translation: 'Нет, спасибо. Мне не нравится эта обувь.', explanation: 'Покупатель только что сказал, что ему нравится эта обувь.' },
    ],
    correctOptionId: 'try', explanation: 'Продавец предлагает принести именно 39-й размер для примерки.',
  },
  {
    id: 'd-polite-06', level: 'A2', categoryId: 'politeness-requests', situationId: 'ask-where-to-write-surname', intentId: 'ask-for-form-guidance',
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
]
