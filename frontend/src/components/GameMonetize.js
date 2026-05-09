export const initGameMonetize = () => {
  window.sdk = window.sdk || {};
  
  if (typeof window.sdk.showBanner === "function") {
    window.sdk.showBanner();
  }
};

export const showRewardedAd = (onComplete) => {
  if (typeof window.sdk.showRewardedAd === "function") {
    window.sdk.showRewardedAd({
      onAdCompleted: () => {
        onComplete(); // Donner le bonus au joueur
      },
      onAdDismissed: () => {
        console.log("Ad dismissed");
      }
    });
  }
};