// Conversation starters for parents. Two per chapter:
//   1) a personal question that helps your child reflect, and
//   2) a "share together" question that you BOTH answer (you go first!) to grow closer to each other and to Jesus.
const PARENT_TALK = {
  1: ['God gave Jesus the name Immanuel, “God with us.” When do you most need to know God is with you?', 'Share together: tell each other about a time you felt God was close to you.'],
  2: ['The wise men brought Jesus their best gifts. What is something special you could give to Jesus?', 'Share together: what is the best gift someone in our family ever gave you, and why did it mean so much?'],
  3: ['God said Jesus was his Son he loves and delights in. How does it feel to know God delights in you too?', 'Share together: tell each other one thing you love and are proud of about the other person.'],
  4: ['Jesus said no to temptation by remembering God’s words. What is something that is hard for you to say no to?', 'Share together: what is something you’re each trying to get better at? How can we cheer each other on this week?'],
  5: ['Jesus said you are the light of the world. When do you feel brave enough to shine?', 'Share together: who is someone that has been a light to you? Let’s thank God for them.'],
  6: ['Jesus said not to worry, because God feeds the birds. What is one thing that worries you right now?', 'Share together: tell each other one worry, then pray for each other’s worry.'],
  7: ['Jesus said, “Ask, seek, knock.” If you could ask God for anything for someone else, what would it be?', 'Share together: what is one prayer God has answered for our family?'],
  8: ['The disciples were scared in the storm and Jesus calmed it. What makes you feel scared?', 'Share together: tell each other about a time you were scared and how God helped you.'],
  9: ['Jesus chose Matthew even though people didn’t like him. Have you ever felt left out? What was that like?', 'Share together: is there someone at school, church or work who needs a friend? How could we include them?'],
  10: ['Jesus said you are worth more than many sparrows. When do you forget how much you matter?', 'Share together: tell each other three things that make the other person special.'],
  11: ['Jesus said, “Come to me, all who are tired.” When do you feel tired or stressed?', 'Share together: what helps each of us rest? Let’s plan one restful thing to do together this week.'],
  12: ['Jesus did good even when others complained. What is one good thing you did, or could do, for someone?', 'Share together: what kind words would each of us like to hear more often? Say them to each other now.'],
  13: ['A tiny mustard seed grows into a big tree. What is something small that God is growing in you?', 'Share together: how have we each grown this year? Tell each other one change you’ve noticed.'],
  14: ['Peter stepped out of the boat because Jesus called him. What is something brave Jesus might be asking you to do?', 'Share together: tell each other about something brave you did. How did it feel?'],
  15: ['A mom kept asking Jesus to help her daughter and didn’t give up. What do you want to keep praying for?', 'Share together: what is one thing we can keep praying for together this month?'],
  16: ['Jesus asked, “Who do you say I am?” Who is Jesus to you, in your own words?', 'Share together: parent, share how you came to know Jesus. Child, ask one question about it.'],
  17: ['God said, “Listen to him.” When is the best time in your day to listen to Jesus?', 'Share together: how could we make a little time each day to listen to Jesus together?'],
  18: ['Jesus said to forgive again and again. Is there someone you find hard to forgive?', 'Share together: is there anything we need to say sorry for or forgive each other for today?'],
  19: ['Jesus said, “Let the little children come to me.” What would you like to say to Jesus if he were sitting with you right now?', 'Share together: what is one thing you love doing together? Let’s plan to do it this week.'],
  20: ['Jesus came to serve, not to be served. Who in our family could you help this week?', 'Share together: tell each other one way the other person has helped or served you lately. Say thank you!'],
  21: ['The crowds shouted “Hosanna!” to praise Jesus. What are you most thankful to Jesus for today?', 'Share together: take turns naming things you’re thankful for. How many can you list together?'],
  22: ['Jesus said to love God with all your heart and to love your neighbor. Who is someone hard for you to love?', 'Share together: how does each of us like to be shown love? (Hugs, kind words, time together, help, or a gift?)'],
  23: ['Jesus wants us to be the same inside and outside. Is there anything on the inside you’d like to tell someone about?', 'Share together: what helps you feel safe to share your feelings with each other?'],
  24: ['Jesus said to stay ready for him. What would you like Jesus to find you doing when he comes back?', 'Share together: what is one habit we could start as a family to stay close to Jesus?'],
  25: ['Jesus said when we help people in need, we help him. Who do you know who needs help or kindness?', 'Share together: what is something we could do together this month to help someone in need?'],
  26: ['Peter said he didn’t know Jesus, but Jesus still loved him. How does it feel to know Jesus forgives you?', 'Share together: tell each other about a time you were forgiven. How did it feel?'],
  27: ['Jesus died on the cross because he loves you. How does it feel to be loved that much?', 'Share together: how can we show each other that kind of love this week?'],
  28: ['Jesus is alive and with you always! What do you want to tell Jesus today?', 'Share together: who could we tell about Jesus? Pray for them together right now.']
};
// "Heart moments" after each chapter (not on chapter 28 — that day the quiz's bonus question asks who they want to share Jesus with): kids can type or record a message (younger kids record by default).
// kind: 'type' (one answer), 'pray' (person + what to pray), 'record' (a voice message for parents).
const HEART_MOMENTS = [
  { kind: 'record', title: 'Message for your parents', prompt: 'What’s one thing you’re grateful to your parents for? Record a message to tell them!' },
  { kind: 'record', title: 'Message for your parents', prompt: 'What’s one thing you love about Jesus? Tell your parents!' },
  { kind: 'pray', title: 'PRAY BREAK!', prompt: 'One person you want to pray for:', prompt2: 'What do you want to pray for them?' },
  { kind: 'record', title: 'Message for your parents', prompt: 'What’s one thing you love about your parents? Record it for them!' },
  { kind: 'type', title: 'Pray for someone', prompt: 'Who do you want to pray for?', placeholder: 'Their name' },
  { kind: 'record', title: 'PRAY BREAK!', prompt: 'Who do you want to pray for right now? Record what you want to say to them!' }
];
