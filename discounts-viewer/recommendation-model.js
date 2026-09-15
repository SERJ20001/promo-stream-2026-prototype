const recommendationDefaults = {
  promotion: false,
  xl: false,
  highlight: false,
  photos: false,
  video: false,
  description: true,
  contacts: false
};

const attractivenessWeights = {
  promotion: 20,
  xl: 10,
  highlight: 10,
  hvatamba: 10,
  delivery: 5,
  quantity: 5,
  photos: 10,
  video: 10,
  contacts: 10
};

function attractivenessScore(selection) {
  return 10 + Object.entries(attractivenessWeights).reduce((total, [key, weight]) => total + (selection[key] === true ? weight : 0), 0);
}

function attractivenessColors(score) {
  if (score >= 60) return { ring: '#965eeb', text: '#965eeb' };
  if (score >= 40) return { ring: '#02d15c', text: '#09b855' };
  if (score > 10) return { ring: '#00aaff', text: '#14a2e9' };
  return { ring: '#000000', text: '#000000' };
}

function paidServicesTotal(selection) {
  return ['promotion', 'xl', 'highlight'].filter(key => selection[key] === true).length * 100;
}
