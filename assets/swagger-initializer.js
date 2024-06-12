window.onload = function () {
	window.ui = SwaggerUIBundle({
		deepLinking: true,
		defaultModelRendering: 'model',
		dom_id: '#swagger-ui',
		layout: 'StandaloneLayout',
		plugins: [SwaggerUIBundle.plugins.DownloadUrl],
		presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
		tryItOutEnabled: true,
		url: '/open-api/openapi.yaml',
		validatorUrl: 'none'
	});
};
