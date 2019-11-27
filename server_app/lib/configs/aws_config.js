/**
 * Created by lakhe on 10/9/17.
 */
(() => {
	'use strict';
	module.exports = {
		aws_api_user: {
			accessKeyId: 'AKIAIADQKBLMHSVBBPTA',
			secretAccessKey: '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',
			region: 'us-east-1',
		},
		s3_bucket: process.env.NODE_ENV === 'production' ? 'dev-bitsbeat-s3' : 'dev-bitsbeat-s3',
		s3_upload_folder: '/uploads',
		sns_api_version: '2010-03-31',
		pre_signed_url_length: 20,
	};
})();
