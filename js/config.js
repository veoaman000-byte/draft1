(function () {
  "use strict";

  /**
   * Draft Motion Plugin Configuration
   * Single source of truth for plugin settings and production backend API URLs.
   */
  window.DraftMotionConfig = {
    // Production Vercel Backend API Base URL
    backendUrl: "https://draft-motion-eta.vercel.app",

    // Endpoints
    deactivateEndpoint: "/api/deactivate-device",

    /**
     * Resolves the complete production backend API URL.
     * Respects window.ZV_BACKEND_URL override if present, otherwise defaults to production Vercel domain.
     */
    getApiEndpoint: function (endpointPath) {
      var targetPath = endpointPath || this.verifyEndpoint;
      var base = (window.ZV_BACKEND_URL || this.backendUrl).replace(/\/$/, "");
      return base.endsWith(targetPath) ? base : base + targetPath;
    }
  };
}());
