(() => {
    'use strict';

    module.exports = {
        routes: {
            analytics_data: {
                base_url: '/api/analytics-data',
                fetch_superadmin_analytics_data: '/admin',
                fetch_imp_info_from_property_dashboard: '/basic-info/imp/:propertyId'
            },
            auth_token: {
                base_url: '/api/configuration/authtoken',
                get_all: '/',
                delete_all: '/',
                get_by_id: '/:authorizationTokenId',
                delete_by_id: '/:authorizationTokenId'
            },
            cloudinary: {
                base_url: '/api/configuration/cloudinary',
                get_all: '/',
                post: '/',
                update_by_id: '/:cloudinarySettingId'
            },
            commission: {
                base_url: '/api/configuration/commission-setting',
                get_all: '/',
                post: '/',
                update_by_id: '/:commissionSettingId'
            },
            support: {
                base_url: '/api/support-feedback',
                get_all: '/data',
                get_by_id: '/data/:supportId',
                delete_by_id: '/data/:supportId',
                post_auth_support_ticket: '/ticket',
                reply_to_support_ticket: '/reply-ticket/:supportId',
                close_support_ticket: '/close-ticket/:supportId'
            },
            email_service: {
                base_url: '/api/configuration/email-service',
                get_all: '/',
                post: '/',
                update_by_id: '/:emailServiceId'
            },
            email_template: {
                base_url: '/api/configuration/email-template',
                get_all: '/',
                post: '/',
                delete: '/:templateId',
                get_by_id: '/:templateId',
                update_by_id: '/:templateId',
                delete_file: '/:templateId',
            },
            emergency_contact_info: {
                base_url: '/api/emergency-contact-info/data',
                get_all: '/:userId',
                post: '/:userId',
                get_by_id: '/:userId/:contactId',
                delete_by_id: '/:userId/:contactId',
                update_by_id: '/:userId/:contactId'
            },
            food_beverages: {
                base_url: '/api/food-beverages',
                get_all: '/:propertyId/:food_beverage_type',
                post: '/:propertyId/:food_beverage_type',
                put: '/:propertyId/:food_beverage_type/:menu_type/:menuId',
                delete: '/:propertyId/:food_beverage_type/:menu_type/:menuId'
            },
            near_tourist_destinations: {
                base_url: '/api/near-tourist-destinations',
                post: '/:propertyId',
                delete_by_id: '/:propertyId/:destinationId',
                update_by_id: '/:propertyId/:destinationId'
            },
            rules_and_regulations: {
                base_url: '/api/rules-regulations',
                post: '/:propertyId',
                deleteRule: '/:propertyId/:ruleId',
                surcharge: '/surcharge',
                surchargedetail: '/surcharge/:id'
            },
            error_logs: {
                base_url: '/api/error-logs',
                get_all: '/',
                delete_all: '/',
                delete_by_id: '/:errorLogId',
                get_by_id: '/:errorLogId'
            },
            site_analytics: {
                base_url: '/api/configuration/site-analytics',
                post: '/',
                delete_file: '/:siteAnalyticsConfigId',
                update_by_id: '/:siteAnalyticsConfigId'
            },
            features: {
                base_url: '/api/configuration/features',
                get_all_feature_types: '/',
                post_feature_type: '/',
                get_new_feature_types: '/new',
                post_new_feature: '/new/:featuretype',
                put_approve_new_feature: '/new/approve/:featuretype',
                put_reject_new_feature: '/new/reject/:featuretype',
                get_all_features_by_type: '/:featuretype',
                post_feature_by_type: '/:featuretype',
                get_features_by_id: '/:featuretype/:featureid',
                update_features_by_id: '/:featuretype/:featureid'
            },
            html_static_content: {
                base_url: '/api/html-static-content',
                post: '/',
                get_by_id: '/:htmlContentId',
                delete_by_id: '/:htmlContentId',
                update_by_id: '/:htmlContentId'
            },
            html_editor: {
                base_url: '/api/html-editor',
                get_all_files: '/file',
                post_file: '/file',
                delete_file: '/file'
            },
            login_attempts: {
                base_url: '/api/logs/login-attempts',
                get_all: '/',
                get_by_id: '/:loginLogId'
            },
            notification: {
                base_url: '/api/notification',
                get_all: '/all',
                get_new: '/new',
                update: '/new',
                update_read_status: '/status/update/:notificationId',
                read_all: '/status/all/update/'
            },
            user_profile: {
                base_url: '/api/user',
                get_all: '/data',
                get_tour: '/tour',
                post_tour: '/tour',
                get_user_account: '/data/bank-account/:userId',
                put_user_account: '/data/bank-account/:userId',
                delete_bank_account_doc: '/data/remove/bank-account/:documentId',
                get_by_id: '/data/:userId',
                delete_by_id: '/data/:userId',
                update_by_id: '/data/:userId',
                update_password: '/security-settings/change-password/:userId',
                update_security_answer: '/security-settings/modify-security-answer/:userId',
                resend_confirmation_email: '/resend-confirm-email',
                suspend_user: '/suspend/:userId',
                sms_verify: '/sms/verification-token',
                validate_number: '/validate/number',
                log_out: '/logout',
                mobile_get: '/mobile',
                mobile_remove: '/mobile',
                send_email_update_verification_link: '/send/link/email-verification/:userId'
            },
            multi_factor_auth: {
                base_url: '/api/multi-factor-auth',
                get_totp_token: '/totp-setup',
                disable_multi_factor_auth: '/totp-disable/:userId',
                enable_multi_factor_auth: '/totp-verify',
                get_mobile_totp_token: '/mobile/totp-setup',
                disable_mobile_multi_factor_auth: '/mobile/totp-disable/:userId',
                enable_mobile_multi_factor_auth: '/mobile/totp-verify',
                get_recovery_codes: '/recovery-code/get',
                send_email_with_recovery_code: '/recovery-code/send/:userId',
                generate_recovery_code_new: '/generate/recovery-code/:userId'
            },
            role_config: {
                base_url: '/api/configuration/role',
                get_all: '/',
                post: '/'
            },
            newsletter: {
                base_url: '/api/newsletter',
                get_all: '/subscribe'
            },
            imp: {
                base_url: '/api/imp',
                get_all_agents: '/applicant/data',
                post_imp_verification_application_request: '/applicant/verification/request',
                get_imp_personal_info_by_id: '/applicant/detail/data/:impId',
                get_resend_mail: '/applicant/resendmail/:impId',
                get_imp_info_by_id: '/applicant/data/:userId',
                get_verified_agents: '/verified/data',
                update_imp_status: '/applicant/status/:userId',
                get_all_referred_agents: '/referral/request',
                get_all_referred_verified_agents: '/referral/registered-imps',
                create_new_agent_referral: '/referral/request',
                imp_application_history: '/applicant/record',
                fix_imp_records: '/fix/imp/record',
                affiliate_imp: '/affiliate/imp/:userId',
                customize_referral_code: '/customize/referral/code',
                check_verification_status: '/check/verification/status/:userId',
                fetch_referral_code: '/fetch/referral/code/:userId',
                apply_imp_normal_user: '/applicant/data',
                imp_detail_data: '/applicant/imp-detail/data/:impId',
                allow_docs_upload_imp_verified: '/docs-upload/allow/:userId',
                get_docs_upload_imp_verified_info: '/docs-upload/allow/:userId'
            },
            property: {
                base_url: '/api/property',
                get_all_properties: '/',
                post_property_info: '/',
                put_basic_info: '/basic-info',
                put_feature_type: '/feature/:feature_type/:id',
                get_feature_type: '/feature/:feature_type/:id',
                get_resend_mail: '/applicant/resendmail/:vendorid',
                post_new_feature_type: '/new-feature/:feature_type/:id',
                fetch_property_id: '/fetch-id',
                post_agent_for_property: '/imp/request',
                get_agent_requested_property: '/imp/request',
                get_agent_verified_property: '/imp/verified',
                get_agent_process_property: '/imp-apply',
                get_property_info_for_imp: '/imp/property-info/:property_id',
                get_property_information_for_user: '/user',
                post_agent_request_for_hotel_user: '/user',
                get_property_information_for_user_id: '/user/:id',
                put_basic_info_id: '/basic-info/:id',
                get_property_photo_by_id: '/photos',
                put_property_photo_by_id: '/photos',
                patch_property_image_by_id: '/photos/:propertyId/:imageId',
                delete_property_photo_by_id: '/photos',
                post_register_property_by_agent_registration_user_by_code: '/contact-user-register/:code',
                get_property_document_by_id: '/document',
                put_property_document_by_id: '/document',
                patch_property_document_by_id: '/document/:propertyId/:documentId',
                delete_property_document_by_name: '/document',
                get_property_info_by_id: '/:propertyid',
                put_property_status_change_by_id: '/applicant/status/:id',
                delete_property_image_delte: "/basic-info/image",
                get_features_by_property_id: '/feature/:id',
                post_features_by_property_id: '/feature/:id',
                get_property_aggrement: '/agreement',
                put_property_aggrement: '/agreement',
                get_payment_and_policies: '/paymentandpolicies',
                put_payment_and_policies: '/paymentandpolicies',
                get_room_taxes: '/room-taxes',
                put_room_taxes: '/room-taxes/:id',
                post_gallery_images: '/gallery',
                get_gallery_images: '/gallery',
                get_gallery_images_id: '/gallery/:id',
                put_gallery_image_id: '/gallery/:id',
                patch_gallery_image_id: '/gallery/:id',
                patch_gallery_image: '/gallery',
                put_gallery_order: '/gallery/order',
                put_room_order: '/gallery/room/order',
                post_property_renovation: '/renovation',
                get_property_renovation: '/renovation',
                get_property_renovation_id: '/renovation/:id',
                put_property_renovation: '/renovation/:id',
                put_property_step: '/property-step',
                valid_documents_of_hotel: '/document-status/:property_id/:document_id',
                signed_url: '/signed-url'

            },
            room_type: {
                base_url: '/api/property',
                get_info: '/room-type',
                get_info_list: '/room-type/list',
                get_room_type_features: '/room-type/features',
                post_info: '/room-type',
                patch_room_status: '/room-type/:id',
                post_room_rate_plan: '/room-rate-plan',
                get_room_rate_plan: '/room-rate-plan',
                get_room_rate_plan_list: '/room-rate-plan/list',
                put_room_rate_plan: '/room-rate-plan/:id',
                get_room_rate_plan_id: '/room-rate-plan/:id',
                patch_room_rate_plan_id: '/room-rate-plan/:id',
                delete_room_rate_plan_id: '/room-rate-plan/:id',
                get_photos_by_room_id: '/room-type/photos/:id',
                put_photos_by_room_id: '/room-type/photos/:id',
                patch_photos_by_room_id: '/room-type/photos/:roomId/:imageId',
                delete_photos_by_room_id: '/room-type/photos/:id',
                get_features_by_room_id: '/room-type/feature/:id',
                get_feature_by_room_id: '/room-type/feature/:feature_type/:id',
                put_feature_by_room_id: '/room-type/feature/:feature_type/:id',
                get_detail_by_id: '/room-type/:id',
                put_detail_by_id: '/room-type/:id',
                get_room_price_by_id: '/room-type-price/:id',

                post_new_feature_for_room_by_feature_type: '/room-type/new-feature/:feature_type/:id'
            },
            hotel_detail: {
                base_url: '/api/hotel-detail',
                get_contact_details_by_id: '/contacts/:id',
                post_contact_details: '/contacts',
                put_contact_details: '/contacts/:id',
                patch_contact_details: '/contacts/:id',
                delete_contact_details: '/contacts/:id',
                get_contact_details: '/contacts',
                get_contact_details_features: '/contacts/features',

                // Bank Account Details
                get_bank_account_details_by_id: '/bank/:id',
                post_bank_account_details: '/bank',
                put_bank_account_details: '/bank',
                patch_bank_account_details: '/bank/:id',
                get_bank_account_details: '/bank',

            },
            tax: {
                base_url: '/api/tax',
                get_tax_by_id: '/:id',
                get_tax: '/',
                post_tax: '/',
                put_tax: '/:id',
                patch_tax: '/:id',
                get_tax_config: '/config'
            },
            booking_info: {
                base_url: '/api/booking-info',
                get_booking_info: '/',
                get_booking_info_by_id: '/:id',
                get_booking_report: '/report'
            },
            faq: {
                base_url: '/api/faq',
                post_faq_title: '/',
                post_faq_subtitle: '/:id',
                update_faq_subtitle: 'subtitle/:id',
                get_faq_language: '/language'
            },
            panic_button: {
                base_url: '/api/send-sos-messages',
                send_sos_message: '/'
            },
            knowledge_base: {
                base_url: '/api/knowledge-base',
                post_category: '/categories',
                put_category: '/categories/:id',
                patch_category: '/categories/:id',
                post_sub_category: '/categories/:id/sub',
                put_sub_category: '/categories/:id/sub/:sub_id',
                patch_sub_category: '/categories/:id/sub/:sub_id',
                post_article: '/article',
                put_article: '/article/:id'
            },
            property_news: {
                base_url: '/api/property-news',
                post_news: '/',
                put_news: '/:newsId'
            },
            vendor: {
                base_url: '/api/vendor',
                post_season: '/season',
                get_season: '/season',
                get_season_by_id: "/season/:id",
                put_season: '/season/:id',
                post_vendor: '/company',
                get_vendor: '/company',
                put_vendor: '/company'
            },
            offer_management: {
                base_url: '/api/offer-management',
                post_coupon: '/coupon',
                get_coupon: '/coupon',
                put_coupon: '/coupon/:id',
                patch_coupon: '/coupon/:id',
                get_coupon_by_id: '/coupon/:id',
                cancellation: '/cancellation'
            },
            content_template: {
                base_url: '/api/content-template',
                get_content: '/content',
                put_content: '/content/:id'
            },
            social_link: {
                base_url: '/api/social-account',
                link_facebook: '/link/facebook/:access_token',
                link_twitter: '/link/twitter/:access_token',
                link_linkedin: '/link/linkedin/:access_token',
                link_google: '/link/google/:access_token',
                unlink_facebook: '/unlink/facebook',
                unlink_twitter: '/unlink/twitter',
                unlink_linkedin: '/unlink/linkedin',
                unlink_google: '/unlink/google',
                checkStatus: '/status'
            },
            email_message_template: {
                base_url: '/api/email-message-template',
                get_template: '/',
                post_template: '/',
                get_template_by_id: '/:templateId',
                put_template_by_id: '/:templateId',
                put_mail: '/send-mail/:templateId',
                get_template_case: '/case',
            },
            push_notification: {
                base_url: '/api/cloud-messaging',
                get_all: '/',
                post: '/',
                update_by_token: '/:token/:platform',
                send_custom_push_notification: '/custom',
                fetch_topics: '/topics',
                fetch_messages: '/messages',
                delete_message: '/messages/:messageId'
            },
            email_status: {
                base_url: '/api/email-status',
                get_all: '/',
                get_block: '/block',
                post_block: '/block'
            },
            admin_access: {
                base_url: '/api/admin-access',
                get_user: '/user/:id'
            },
            identity_access_management: {
                base_url: '/api/identity-access-management',
                get_all_iam_users: '/user',
                save_iam_user: '/user',
                get_all_iam_user_roles: '/role',
                create_iam_role: '/role',
                get_iam_role_detail: '/role/:roleId',
                update_iam_role: '/role/:roleId',
                delete_iam_role: '/role/:roleId',
                get_all_iam_policies: '/policy',
                save_iam_policy: '/policy',
                get_policy_detail: '/policy/:policyRuleId',
                update_policy: '/policy/:policyRuleId',
                get_policy_rule_list: '/policy-rule/:policyRuleId',
                attach_policy_rule: '/policy-rule/:policyRuleId',
                update_policy_rule: '/policy-rule/:policyRuleId/:ruleId',
                get_policy_rule_detail_info: '/policy-rule/:policyRuleId/:ruleId',
                remove_policy_rule: '/policy-rule/:policyRuleId/:ruleId',
                get_all_iam_groups: '/group',
                create_iam_group: '/group',
                get_iam_group_detail: '/group/:groupId',
                delete_iam_group: '/group/:groupId',
                update_iam_group: '/group/:groupId',
                get_actions_list: '/group-actions/:groupId',
                attach_actions_group: '/group-actions/:groupId',
                get_action_detail: '/group-actions/:groupId/:actionId',
                update_action_info: '/group-actions/:groupId/:actionId',
                remove_action_info: '/group-actions/:groupId/:actionId',
                get_all_actions_role_wise: '/group-list-actions/:user_role'
            },
            fake_emails: {
                base_url: '/api/fake-emails',
                get_all_fake_emails: '/list',
                detect_and_post_fake_email: '/detect'
            },
            xcel_tokens: {
                base_url: '/api/offer-xcel-tokens',
                get_xcel_token_count: '/',
                get_xcel_token_history_list: '/list',
                create_xcel_token_records: '/',
                allocate_xceltoken_special_users: "/special-rewards",
                allocate_xceltoken_exceptional_users: "/exceptional-rewards",
                list_token_allocated_value_of_user: "/admin/list/:tokenAllocatedUserId",
                get_token_allocation_value_report: "/reports",
                allocateTokenToVerifiedIMPs: '/reward/xcel/verified-imps',
                allocateTokenToIMPRefereeIMPs: '/reward/xcel/imp-referee',
                allocateTokenToVendorRefereeIMPs: '/reward/xcel/vendor-referee'
            },
            xcel_token_campaign: {
                base_url: '/api/xcel-token/campaign',
                get_xcel_token_campaigns: '/',
                get_xcel_token_campaign_info_by_id: '/:campaignId',
                create_xcel_token_campaign: '/',
                update_xcel_token_campaign: '/:campaignId'
            },
            emailCheckValidator: {
                base_url: '/api/email-checks',
                get_suspended_email_domains: '/suspend',
                get_bounce_email_records: '/bounce',
                save_suspended_email_domains: '/suspend'
            },
            room_inventory: {
                base_url: '/api/room-inventory',
                inventory_data: '/date/:date',
                inventory_data_room: '/date/:date/:room_type_id',
                room_inventory: '/inventory',
                room_inventory_update: '/inventory/:id',
                room_pricing: '/priceplan'
            },
            property_offer: {
                base_url: '/api/property-offer',
                patch_status: '/:id',
                set_policy_default: '/set-policy-default/:id',
                base_all: '/',
                detail: '/:id',
                type: '/type',
                cancellationpolicy: '/cancellationpolicy',
                cancellationpolicydetail: '/cancellationpolicy/:id',
                assigncancellationpolicy: '/assigncancellationpolicy',
                assigncancellationpolicy_detail: '/assigncancellationpolicy/:id'
            },
            reporting: {
                base_url: '/api/reporting',
                generate_imp_report: '/imps/:status'
            },
            booking_report:{
                base_url:'/api/booking-report',
                base_all :'/',
                detail:'/:bookingId',
                dashboard_info:'/dashboard',
                export:'/export'
            }
        }

    };

})();
