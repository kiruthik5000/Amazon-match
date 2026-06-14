import backendApi from './backendAxios';

const creditsApi = {
  getCredits: (userId) =>
    backendApi.get(`/credits/${userId}`).then((r) => r.data.data),

  awardCredits: (userId, lifeScore, productTitle = '') =>
    backendApi.post('/credits/award', { userId, lifeScore, productTitle }).then((r) => r.data.data),
};

export default creditsApi;
