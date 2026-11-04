/**
 * Checked price expressions for T4. Numeral spelling follows the official
 * Modern Greek grammar (chapter C_04):
 * https://ebooks.edu.gr/ebooks/v/html/8547/2334/Grammatiki-Neas-Ellinikis-Glossas_A-B-G-Gymnasiou_html-apli/index_C_04.html
 * ευρώ is indeclinable in the Triantafyllidis dictionary:
 * https://www.greek-language.gr/greekLang/modern_greek/tools/lexica/triantafyllides/search.html?dq=&lq=%CE%95%CF%85%CF%81%CF%8E
 * λεπτό/λεπτά is checked there and against Greek ECB coin descriptions:
 * https://www.greek-language.gr/greekLang/modern_greek/tools/lexica/triantafyllides/search.html?lq=%CE%BB%CE%B5%CF%80%CF%84%CF%8C
 * https://www.ecb.europa.eu/euro/coins/html/gr.el.html
 * Expressions are stored as whole phrases.
 */
export interface VerifiedOrderPrice {
  id: string
  greek: string
  value: number
}

export const VERIFIED_ORDER_PRICES: VerifiedOrderPrice[] = [
  { id: '50-cent', greek: 'πενήντα λεπτά', value: 50 },
  { id: '60-cent', greek: 'εξήντα λεπτά', value: 60 },
  { id: '70-cent', greek: 'εβδομήντα λεπτά', value: 70 },
  { id: '80-cent', greek: 'ογδόντα λεπτά', value: 80 },
  { id: '90-cent', greek: 'ενενήντα λεπτά', value: 90 },
  { id: '100-cent', greek: 'ένα ευρώ', value: 100 },
  { id: '120-cent', greek: 'ένα ευρώ και είκοσι λεπτά', value: 120 },
  { id: '150-cent', greek: 'ένα ευρώ και πενήντα λεπτά', value: 150 },
  { id: '180-cent', greek: 'ένα ευρώ και ογδόντα λεπτά', value: 180 },
  { id: '200-cent', greek: 'δύο ευρώ', value: 200 },
  { id: '220-cent', greek: 'δύο ευρώ και είκοσι λεπτά', value: 220 },
  { id: '250-cent', greek: 'δύο ευρώ και πενήντα λεπτά', value: 250 },
  { id: '300-cent', greek: 'τρία ευρώ', value: 300 },
  { id: '350-cent', greek: 'τρία ευρώ και πενήντα λεπτά', value: 350 },
  { id: '400-cent', greek: 'τέσσερα ευρώ', value: 400 },
  { id: '450-cent', greek: 'τέσσερα ευρώ και πενήντα λεπτά', value: 450 },
  { id: '500-cent', greek: 'πέντε ευρώ', value: 500 },
]
