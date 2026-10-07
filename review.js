// Home review quiz: one new question per chapter, different from the daily quiz.
// Format matches QUESTIONS rows: [prompt, correct, wrong, wrong].
// "little" questions stay inside the one verse ages 4–6 read; "big" questions use the full chapter.
const REVIEW = [
 {little:['Was the baby a boy or a girl?','A boy, a son','A girl, a daughter','Twin babies'],big:['The angel called Joseph the son of which king?','David','Saul','Herod']},
 {little:['What did the visitors do when they saw the star?','They shouted joyfully','They fell asleep','They ran away']        ,big:['What gifts did the wise men bring?','Gold, frankincense, and myrrh','Bread, fish, and water','Silver, wool, and oil']},
 {little:['How does God feel about his Son?','He takes great delight in him','He is upset with him','He forgot about him'],big:['What did John the Baptist eat?','Locusts and wild honey','Bread and fish','Figs and grapes']},
 {little:['What did Jesus promise to turn them into?','Fishers of people','Kings and queens','Farmers']                     ,big:['How many days did Jesus fast in the wilderness?','Forty','Seven','Three']},
 {little:['Where is the city in this verse?','On a hill','Under the sea','Inside a cave']                                    ,big:['Jesus said to love your enemies and do what for those who persecute you?','Pray for them','Run from them','Ignore them']},
 {little:['What are we doing in this verse?','Praying','Singing a song','Running a race'],big:['What did Jesus say not to worry about?','Tomorrow','The stars','The weather']},
 {little:['If you knock, what will be opened?','The door','A window','A treasure box'],big:['What did Jesus say to take out of your own eye first?','The beam','A seed','A tear']},
 {little:['What did Jesus do before he spoke to the wind?','He got up','He sang','He ate'],big:['Whose mother-in-law did Jesus heal of a fever?','Peter’s','John’s','Herod’s']},
 {little:['What was the man lying on?','A stretcher','A boat','A horse'],big:['What did the sick woman touch to be healed?','The edge of his cloak','His sandal','His hand']},
 {little:['How does God see you in this verse?','More valuable than many sparrows','Smaller than a sparrow','Not important'],big:['Jesus told them to be wise as what?','Serpents','Owls','Lions']},
 {little:['Can tired people come to Jesus?','Yes, all of them','No, never','Only grown-ups'],big:['What did Jesus say about his load?','It is not hard to carry','It is too heavy','It is lost']},
 {little:['Which animal does Jesus compare a person to?','A sheep','A lion','A fish']                                         ,big:['What was wrong with the man Jesus healed in the synagogue?','His hand was withered','He could not hear','He had a fever']},
 {little:['Who planted the seed?','A man','A bird','A king'],big:['In the parable of the sower, where did the seed grow a good crop?','On good soil','On the path','Among thorns']},
 {little:['How many fish were there?','Two','Ten','None']                                                                      ,big:['What did Peter do when Jesus called him out of the boat?','Walked on the water','Swam to shore','Went to sleep']},
 {little:['Who did Jesus call to him?','His disciples','The soldiers','The fish sellers'],big:['How many loaves did Jesus use to feed the four thousand?','Seven','Two','Twelve']},
 {little:['What was Peter’s other name in this verse?','Simon','Andrew','James'],big:['Who did some people say Jesus was?','John the Baptist','Pilate','Caesar']},
 {little:['Was Jesus still speaking when the cloud came?','Yes','No, he was asleep','No, he had left'],big:['Who did Jesus heal when the disciples could not?','A boy','A soldier','A king']},
 {little:['Who should we be humble like?','A little child','A king','A giant']                                                 ,big:['How many sheep did the shepherd leave to look for the lost one?','Ninety-nine','Ten','Fifty']},
 {little:['Who did Jesus say could come to him?','The little children','Only kings','Only soldiers']                          ,big:['What did Jesus tell the rich young man to do with his things?','Sell them and give to the poor','Hide them','Build bigger barns']},
 {little:['Who is the Son of Man in this verse?','Jesus','Peter','Moses'],big:['Whose mother asked Jesus to let her sons sit beside him?','The sons of Zebedee','The sons of Pilate','The sons of Herod']},
 {little:['Where were the shouting crowds?','In front of him and behind him','Only on a boat','Nobody was there'],big:['What did people spread on the road?','Their cloaks and branches','Gold coins','Snow']},
 {little:['Besides our heart, what else should we love God with?','Our soul and our mind','Our shoes','Our hats'],big:['Who did the king invite after the first guests would not come?','Everyone they found in the streets','Only kings','Nobody']},
 {little:['What happens to the one who humbles himself?','He will be lifted up','He will be forgotten','He will get lost']   ,big:['Jesus said the greatest among you will be your what?','Servant','Ruler','Judge']},
 {little:['How should we be while we wait for the Lord?','Ready and watching','Bored','Grumpy'],big:['Who knows the day and hour when the Son of Man will come?','Only the Father','The angels','Everyone']},
 {little:['The servant was faithful in a few things. What will he be put in charge of?','Many things','Nothing','One thing'],big:['How many talents did the first servant get?','Five','One','Ten']},
 {little:['When did Jesus take the bread?','While they were eating','While they were fishing','While they were sleeping'],big:['How many times did Peter deny knowing Jesus?','Three','Once','Seven']},
 {little:['What shook the ground?','An earthquake','A big drum','A herd of horses'],big:['What happened to the temple curtain?','It was torn in two','It caught fire','It turned gold']},
 {little:['Is Jesus still in the tomb?','No, he has been raised','Yes, he is sleeping','He went fishing']                     ,big:['Who rolled away the stone from the tomb?','An angel of the Lord','The soldiers','Peter']}
];
