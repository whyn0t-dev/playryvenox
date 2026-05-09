export const initGameMonetize = () => {
  if (typeof window.sdk !== 'undefined') {
    window.sdk.gameLoadingFinished();
  }
};

export const showRewardedAd = (onComplete) => {
  if (typeof window.sdk !== 'undefined') {
    window.sdk.showBanner();
    window.sdk.addEventListener('rewardedAdCompleted', () => {
      onComplete();
    });
  } else {
    // En local, simuler le bonus directement
    onComplete();
  }
};