(() => {
    'use strict';

    const roleConfig = require('../configs/role.config');
    const appRoutes = require('../configs/app-routes.config');

    module.exports = {
        route_access: {
            GET: {
                common: [
                    {route_api: `${appRoutes.routes.auth_token.base_url}${appRoutes.routes.auth_token.get_all}`},
                    {route_api: `${appRoutes.routes.auth_token.base_url}${appRoutes.routes.auth_token.get_by_id}`},
                    {route_api: `${appRoutes.routes.html_editor.base_url}${appRoutes.routes.html_editor.get_all_files}`},
                    {route_api: `${appRoutes.routes.login_attempts.base_url}${appRoutes.routes.login_attempts.get_all}`},
                    {route_api: `${appRoutes.routes.login_attempts.base_url}${appRoutes.routes.login_attempts.get_by_id}`},

                    {route_api: `${appRoutes.routes.notification.base_url}${appRoutes.routes.notification.get_all}`},
                    {route_api: `${appRoutes.routes.notification.base_url}${appRoutes.routes.notification.get_new}`},

                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.get_by_id}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.mobile_get}`},
                    {route_api: `${appRoutes.routes.multi_factor_auth.base_url}${appRoutes.routes.multi_factor_auth.get_totp_token}`},
                    {route_api: `${appRoutes.routes.multi_factor_auth.base_url}${appRoutes.routes.multi_factor_auth.get_mobile_totp_token}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.get_imp_info_by_id}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.get_imp_personal_info_by_id}`},
                    {route_api: `${appRoutes.routes.emergency_contact_info.base_url}${appRoutes.routes.emergency_contact_info.get_all}`},
                    {route_api: `${appRoutes.routes.emergency_contact_info.base_url}${appRoutes.routes.emergency_contact_info.get_by_id}`},
                    {route_api: `${appRoutes.routes.support.base_url}${appRoutes.routes.support.get_all}`},
                    {route_api: `${appRoutes.routes.support.base_url}${appRoutes.routes.support.get_by_id}`},
                    {route_api: `${appRoutes.routes.social_link.base_url}${appRoutes.routes.social_link.checkStatus}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.get_tour}`},
                    {route_api: `${appRoutes.routes.multi_factor_auth.base_url}${appRoutes.routes.multi_factor_auth.get_recovery_codes}`},
                    {route_api: `${appRoutes.routes.xcel_tokens.base_url}${appRoutes.routes.xcel_tokens.get_xcel_token_count}`},
                    {route_api: `${appRoutes.routes.xcel_tokens.base_url}${appRoutes.routes.xcel_tokens.get_xcel_token_history_list}`},

                ],
                [roleConfig.superadmin]: [
                    {route_api: `${appRoutes.routes.cloudinary.base_url}${appRoutes.routes.cloudinary.get_all}`},
                    {route_api: `${appRoutes.routes.commission.base_url}${appRoutes.routes.commission.get_all}`},
                    {route_api: `${appRoutes.routes.email_service.base_url}${appRoutes.routes.email_service.get_all}`},
                    {route_api: `${appRoutes.routes.email_template.base_url}${appRoutes.routes.email_template.get_all}`},
                    {route_api: `${appRoutes.routes.email_template.base_url}${appRoutes.routes.email_template.get_by_id}`},
                    {route_api: `${appRoutes.routes.error_logs.base_url}${appRoutes.routes.error_logs.get_all}`},
                    {route_api: `${appRoutes.routes.error_logs.base_url}${appRoutes.routes.error_logs.get_by_id}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.get_all_feature_types}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.get_all_features_by_type}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.get_features_by_id}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.get_new_feature_types}`},
                    {route_api: `${appRoutes.routes.html_static_content.base_url}${appRoutes.routes.html_static_content.get_by_id}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.get_all}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.get_user_account}`},
                    {route_api: `${appRoutes.routes.role_config.base_url}${appRoutes.routes.role_config.get_all}`},
                    {route_api: `${appRoutes.routes.newsletter.base_url}${appRoutes.routes.newsletter.get_all}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.get_all_agents}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.get_verified_agents}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.imp_application_history}`},

                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.get_all_referred_agents}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.get_all_referred_verified_agents}`},

                    /*Get properties By Admin*/
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_all_properties}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_photo_by_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_document_by_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_info_by_id}`},

                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_photos_by_room_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_feature_by_room_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_features_by_room_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_detail_by_id}`},

                    {route_api: `${appRoutes.routes.analytics_data.base_url}${appRoutes.routes.analytics_data.fetch_superadmin_analytics_data}`},

                    /* */
                    /* Get email Message Template by  SuperAdmin*/

                    {route_api: `${appRoutes.routes.email_message_template.base_url}${appRoutes.routes.email_message_template.get_template}`},
                    {route_api: `${appRoutes.routes.email_message_template.base_url}${appRoutes.routes.email_message_template.get_template_by_id}`},
                    {route_api: `${appRoutes.routes.email_message_template.base_url}${appRoutes.routes.email_message_template.get_template_case}`},
                    {route_api: `${appRoutes.routes.push_notification.base_url}${appRoutes.routes.push_notification.get_all}`},
                    {route_api: `${appRoutes.routes.push_notification.base_url}${appRoutes.routes.push_notification.fetch_topics}`},
                    {route_api: `${appRoutes.routes.push_notification.base_url}${appRoutes.routes.push_notification.fetch_messages}`},


                    /*End */
                    {route_api: `${appRoutes.routes.email_status.base_url}${appRoutes.routes.email_status.get_all}`},
                    {route_api: `${appRoutes.routes.email_status.base_url}${appRoutes.routes.email_status.get_block}`},

                    /*Identity Access management*/
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_all_iam_users}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_all_iam_user_roles}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_all_iam_policies}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_iam_role_detail}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_policy_rule_detail_info}`},
                    {route_api: `${appRoutes.routes.admin_access.base_url}${appRoutes.routes.admin_access.get_user}`},

                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_policy_detail}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_policy_rule_list}`},

                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_all_iam_groups}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_iam_group_detail}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_actions_list}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_action_detail}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.get_all_actions_role_wise}`},

                    {route_api: `${appRoutes.routes.fake_emails.base_url}${appRoutes.routes.fake_emails.get_all_fake_emails}`},
                    {route_api: `${appRoutes.routes.xcel_token_campaign.base_url}${appRoutes.routes.xcel_token_campaign.get_xcel_token_campaigns}`},
                    {route_api: `${appRoutes.routes.xcel_token_campaign.base_url}${appRoutes.routes.xcel_token_campaign.get_xcel_token_campaign_info_by_id}`},


                    {route_api: `${appRoutes.routes.xcel_tokens.base_url}${appRoutes.routes.xcel_tokens.get_token_allocation_value_report}`},
                    {route_api: `${appRoutes.routes.xcel_tokens.base_url}${appRoutes.routes.xcel_tokens.list_token_allocated_value_of_user}`},


                    {route_api: `${appRoutes.routes.emailCheckValidator.base_url}${appRoutes.routes.emailCheckValidator.get_bounce_email_records}`},
                    {route_api: `${appRoutes.routes.emailCheckValidator.base_url}${appRoutes.routes.emailCheckValidator.get_suspended_email_domains}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.check_verification_status}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.fetch_referral_code}`},

                    /* Get Content Template by  SuperAdmin*/
                    {route_api: `${appRoutes.routes.content_template.base_url}${appRoutes.routes.content_template.get_content}`},
                    {route_api: `${appRoutes.routes.reporting.base_url}${appRoutes.routes.reporting.generate_imp_report}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.get_docs_upload_imp_verified_info}`},
                    {route_api: `${appRoutes.routes.faq.get_faq_language}${appRoutes.routes.faq.get_faq_language}`},

                    /* Get Booking Information SuperAdmin*/
                    {route_api: `${appRoutes.routes.booking_info.base_url}${appRoutes.routes.booking_info.get_booking_info}`},
                    {route_api: `${appRoutes.routes.booking_info.base_url}${appRoutes.routes.booking_info.get_booking_info_by_id}`},
                    {route_api: `${appRoutes.routes.booking_info.base_url}${appRoutes.routes.booking_info.get_booking_report}`},

                ],
                [roleConfig.independent_marketing_partner]: [
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.get_all_feature_types}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.get_all_features_by_type}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.get_features_by_id}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.get_user_account}`},

                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.get_resend_mail}`},

                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.get_all_referred_agents}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.get_all_referred_verified_agents}`},
                    /*Get properties By Independent Marketing Partner*/
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_agent_requested_property}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_agent_verified_property}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_agent_process_property}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_photo_by_id}`},
                    //  { route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_document_by_id}` },
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_info_by_id}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.imp_application_history}`},

                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_photos_by_room_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_feature_by_room_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_features_by_room_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_resend_mail}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.check_verification_status}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.fetch_referral_code}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.imp_detail_data}`},

                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.get_docs_upload_imp_verified_info}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_info_for_imp}`},
                ],
                [roleConfig.enduser]: [
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.get_user_account}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.imp_application_history}`},
                ],
                [roleConfig.vendor]: [
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.get_all_feature_types}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.get_all_features_by_type}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.get_features_by_id}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.get_user_account}`},

                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_detail_by_id}`},
                    /*Get properties By Hotel Admin*/
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_information_for_user}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_aggrement}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_payment_and_policies}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_information_for_user_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_photo_by_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_document_by_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_info_by_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.fetch_property_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_gallery_images}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_gallery_images_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_photos_by_room_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_feature_by_room_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_features_by_room_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_feature_type}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_features_by_property_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_room_taxes}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_renovation}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_property_renovation_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_info}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_info_list}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_room_type_features}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_room_price_by_id}`},
                    {route_api: `${appRoutes.routes.analytics_data.base_url}${appRoutes.routes.analytics_data.fetch_imp_info_from_property_dashboard}`},
                    {route_api: `${appRoutes.routes.vendor.base_url}${appRoutes.routes.vendor.get_vendor}`},
                    {route_api: `${appRoutes.routes.vendor.base_url}${appRoutes.routes.vendor.get_season_by_id}`},
                    {route_api: `${appRoutes.routes.vendor.base_url}${appRoutes.routes.vendor.get_season}`},
                    {route_api: `${appRoutes.routes.offer_management.base_url}${appRoutes.routes.offer_management.get_coupon}`},
                    {route_api: `${appRoutes.routes.offer_management.base_url}${appRoutes.routes.offer_management.cancellation}`},
                    {route_api: `${appRoutes.routes.offer_management.base_url}${appRoutes.routes.offer_management.get_coupon_by_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_room_rate_plan}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_room_rate_plan_list}`},
                    {route_api: `${appRoutes.routes.room_inventory.base_url}${appRoutes.routes.room_inventory.room_inventory}`},
                    {route_api: `${appRoutes.routes.room_inventory.base_url}${appRoutes.routes.room_inventory.inventory_data}`},
                    {route_api: `${appRoutes.routes.room_inventory.base_url}${appRoutes.routes.room_inventory.inventory_data_room}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_room_rate_plan_id}`},
                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.get_contact_details}`},
                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.get_contact_details_by_id}`},
                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.get_contact_details_features}`},
                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.get_bank_account_details}`},
                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.get_bank_account_details_by_id}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.type}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.base_all}`},
                    {route_api: `${appRoutes.routes.rules_and_regulations.base_url}${appRoutes.routes.rules_and_regulations.surcharge}`},
                    {route_api: `${appRoutes.routes.rules_and_regulations.base_url}${appRoutes.routes.rules_and_regulations.surchargedetail}`},
                    {route_api: `${appRoutes.routes.tax.base_url}${appRoutes.routes.tax.get_tax}`},
                    {route_api: `${appRoutes.routes.tax.base_url}${appRoutes.routes.tax.get_tax_by_id}`},
                    {route_api: `${appRoutes.routes.tax.base_url}${appRoutes.routes.tax.get_tax_config}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.detail}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.cancellationpolicy}`},

                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.cancellationpolicydetail}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.assigncancellationpolicy}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.assigncancellationpolicy_detail}`},
                    {route_api: `${appRoutes.routes.booking_report.base_url}${appRoutes.routes.booking_report.base_all}`},
                    {route_api: `${appRoutes.routes.booking_report.base_url}${appRoutes.routes.booking_report.detail}`},
                    {route_api: `${appRoutes.routes.booking_report.base_url}${appRoutes.routes.booking_report.dashboard_info}`},
                    {route_api: `${appRoutes.routes.booking_report.base_url}${appRoutes.routes.booking_report.export}`},


                    /* */
                ]
            },
            POST: {
                common: [
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.resend_confirmation_email}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.sms_verify}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.validate_number}`},
                    {route_api: `${appRoutes.routes.multi_factor_auth.base_url}${appRoutes.routes.multi_factor_auth.enable_multi_factor_auth}`},
                    {route_api: `${appRoutes.routes.multi_factor_auth.base_url}${appRoutes.routes.multi_factor_auth.enable_mobile_multi_factor_auth}`},
                    {route_api: `${appRoutes.routes.support.base_url}${appRoutes.routes.support.post_auth_support_ticket}`},
                    {route_api: `${appRoutes.routes.social_link.base_url}${appRoutes.routes.social_link.link_facebook}`},
                    {route_api: `${appRoutes.routes.social_link.base_url}${appRoutes.routes.social_link.link_linkedin}`},
                    {route_api: `${appRoutes.routes.social_link.base_url}${appRoutes.routes.social_link.link_google}`},
                    {route_api: `${appRoutes.routes.social_link.base_url}${appRoutes.routes.social_link.link_twitter}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.post_tour}`},
                    {route_api: `${appRoutes.routes.xcel_tokens.base_url}${appRoutes.routes.xcel_tokens.create_xcel_token_records}`},
                ],
                [roleConfig.superadmin]: [
                    {route_api: `${appRoutes.routes.html_editor.base_url}${appRoutes.routes.html_editor.post_file}`},
                    {route_api: `${appRoutes.routes.cloudinary.base_url}${appRoutes.routes.cloudinary.post}`},
                    {route_api: `${appRoutes.routes.commission.base_url}${appRoutes.routes.commission.post}`},
                    {route_api: `${appRoutes.routes.email_service.base_url}${appRoutes.routes.email_service.post}`},
                    {route_api: `${appRoutes.routes.email_template.base_url}${appRoutes.routes.email_template.post}`},
                    {route_api: `${appRoutes.routes.site_analytics.base_url}${appRoutes.routes.site_analytics.post}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.post_feature_type}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.post_feature_by_type}`},
                    {route_api: `${appRoutes.routes.html_static_content.base_url}${appRoutes.routes.html_static_content.post}`},
                    {route_api: `${appRoutes.routes.role_config.base_url}${appRoutes.routes.role_config.post}`},
                    {route_api: `${appRoutes.routes.panic_button.base_url}${appRoutes.routes.panic_button.send_sos_message}`},
                    {route_api: `${appRoutes.routes.knowledge_base.base_url}${appRoutes.routes.knowledge_base.post_category}`},
                    {route_api: `${appRoutes.routes.knowledge_base.base_url}${appRoutes.routes.knowledge_base.post_sub_category}`},
                    {route_api: `${appRoutes.routes.knowledge_base.base_url}${appRoutes.routes.knowledge_base.post_article}`},

                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.fix_imp_records}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.affiliate_imp}`},

                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.send_email_update_verification_link}`},
                    /**/
                    /* Post email Message Template by  SuperAdmin*/

                    {route_api: `${appRoutes.routes.email_message_template.base_url}${appRoutes.routes.email_message_template.post_template}`},
                    {route_api: `${appRoutes.routes.push_notification.base_url}${appRoutes.routes.push_notification.send_custom_push_notification}`},


                    /*Identity Access management*/
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.save_iam_user}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.create_iam_role}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.save_iam_policy}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.create_iam_group}`},

                    /*End */
                    {route_api: `${appRoutes.routes.email_status.base_url}${appRoutes.routes.email_status.post_block}`},
                    {route_api: `${appRoutes.routes.fake_emails.base_url}${appRoutes.routes.fake_emails.detect_and_post_fake_email}`},
                    {route_api: `${appRoutes.routes.xcel_token_campaign.base_url}${appRoutes.routes.xcel_token_campaign.create_xcel_token_campaign}`},
                    {route_api: `${appRoutes.routes.xcel_tokens.base_url}${appRoutes.routes.xcel_tokens.allocate_xceltoken_special_users}`},
                    {route_api: `${appRoutes.routes.xcel_tokens.base_url}${appRoutes.routes.xcel_tokens.allocate_xceltoken_exceptional_users}`},

                    {route_api: `${appRoutes.routes.emailCheckValidator.base_url}${appRoutes.routes.emailCheckValidator.save_suspended_email_domains}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.customize_referral_code}`},

                    {route_api: `${appRoutes.routes.xcel_tokens.base_url}${appRoutes.routes.xcel_tokens.allocateTokenToVerifiedIMPs}`},
                    {route_api: `${appRoutes.routes.xcel_tokens.base_url}${appRoutes.routes.xcel_tokens.allocateTokenToIMPRefereeIMPs}`},
                    {route_api: `${appRoutes.routes.xcel_tokens.base_url}${appRoutes.routes.xcel_tokens.allocateTokenToVendorRefereeIMPs}`},

                    /*FAQ*/
                    {route_api: `${appRoutes.routes.faq.base_url}${appRoutes.routes.faq.post_faq_title}`},
                    {route_api: `${appRoutes.routes.faq.base_url}${appRoutes.routes.faq.post_faq_subtitle}`}



                ],
                [roleConfig.independent_marketing_partner]: [
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.post_imp_verification_application_request}`},

                    {route_api: `${appRoutes.routes.html_editor.base_url}${appRoutes.routes.html_editor.post_file}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.create_new_agent_referral}`},
                    /*POST properties By  imp*/
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.post_agent_for_property}`},
                    {route_api: `${appRoutes.routes.emergency_contact_info.base_url}${appRoutes.routes.emergency_contact_info.post}`},
                    {route_api: `${appRoutes.routes.near_tourist_destinations.base_url}${appRoutes.routes.near_tourist_destinations.post}`},
                    {route_api: `${appRoutes.routes.panic_button.base_url}${appRoutes.routes.panic_button.send_sos_message}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.customize_referral_code}`},
                    /**/
                ],
                [roleConfig.enduser]: [
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.post_imp_verification_application_request}`},
                    {route_api: `${appRoutes.routes.emergency_contact_info.base_url}${appRoutes.routes.emergency_contact_info.post}`},
                    {route_api: `${appRoutes.routes.panic_button.base_url}${appRoutes.routes.panic_button.send_sos_message}`},
                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.apply_imp_normal_user}`},

                ],
                [roleConfig.vendor]: [
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.post_new_feature}`},
                    {route_api: `${appRoutes.routes.html_editor.base_url}${appRoutes.routes.html_editor.post_file}`},
                    /*POST properties By  hotel admin*/
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.post_agent_request_for_hotel_user}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.post_register_property_by_agent_registration_user_by_code}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.post_property_renovation}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.post_info}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.post_new_feature_for_room_by_feature_type}`},
                    {route_api: `${appRoutes.routes.near_tourist_destinations.base_url}${appRoutes.routes.near_tourist_destinations.post}`},
                    {route_api: `${appRoutes.routes.rules_and_regulations.base_url}${appRoutes.routes.rules_and_regulations.post}`},
                    {route_api: `${appRoutes.routes.rules_and_regulations.base_url}${appRoutes.routes.rules_and_regulations.surcharge}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.post_new_feature_type}`},
                    {route_api: `${appRoutes.routes.food_beverages.base_url}${appRoutes.routes.food_beverages.post}`},
                    {route_api: `${appRoutes.routes.property_news.base_url}${appRoutes.routes.property_news.post_news}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.get_room_taxes}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.post_gallery_images}`},
                    {route_api: `${appRoutes.routes.vendor.base_url}${appRoutes.routes.vendor.post_vendor}`},
                    {route_api: `${appRoutes.routes.vendor.base_url}${appRoutes.routes.vendor.post_season}`},
                    {route_api: `${appRoutes.routes.offer_management.base_url}${appRoutes.routes.offer_management.post_coupon}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.post_room_rate_plan}`},

                    {route_api: `${appRoutes.routes.room_inventory.base_url}${appRoutes.routes.room_inventory.room_inventory}`},
                    {route_api: `${appRoutes.routes.room_inventory.base_url}${appRoutes.routes.room_inventory.room_pricing}`},

                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.post_contact_details}`},
                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.post_bank_account_details}`},

                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.post_features_by_property_id}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.base_all}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.cancellationpolicy}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.assigncancellationpolicy}`},
                    {route_api: `${appRoutes.routes.tax.base_url}${appRoutes.routes.tax.post_tax}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.signed_url}`},


                    /**/
                ]
            },
            PUT: {
                common: [

                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.put_user_account}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.update_by_id}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.update_password}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.update_security_answer}`},
                    {route_api: `${appRoutes.routes.multi_factor_auth.base_url}${appRoutes.routes.multi_factor_auth.disable_multi_factor_auth}`},
                    {route_api: `${appRoutes.routes.multi_factor_auth.base_url}${appRoutes.routes.multi_factor_auth.disable_mobile_multi_factor_auth}`},
                    {route_api: `${appRoutes.routes.support.base_url}${appRoutes.routes.support.close_support_ticket}`},
                    {route_api: `${appRoutes.routes.support.base_url}${appRoutes.routes.support.reply_to_support_ticket}`},
                    {route_api: `${appRoutes.routes.multi_factor_auth.base_url}${appRoutes.routes.multi_factor_auth.generate_recovery_code_new}`},
                    {route_api: `${appRoutes.routes.push_notification.base_url}${appRoutes.routes.push_notification.update_by_token}`},

                ],
                [roleConfig.superadmin]: [
                    {route_api: `${appRoutes.routes.cloudinary.base_url}${appRoutes.routes.cloudinary.update_by_id}`},
                    {route_api: `${appRoutes.routes.commission.base_url}${appRoutes.routes.commission.update_by_id}`},
                    {route_api: `${appRoutes.routes.email_service.base_url}${appRoutes.routes.email_service.update_by_id}`},
                    {route_api: `${appRoutes.routes.email_template.base_url}${appRoutes.routes.email_template.update_by_id}`},
                    {route_api: `${appRoutes.routes.site_analytics.base_url}${appRoutes.routes.site_analytics.update_by_id}`},

                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.update_features_by_id}`},

                    {route_api: `${appRoutes.routes.html_static_content.base_url}${appRoutes.routes.html_static_content.update_by_id}`},

                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.suspend_user}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.put_user_account}`},


                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.update_imp_status}`},
                    /*PUT properties By  superuser*/
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_property_document_by_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_property_status_change_by_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.valid_documents_of_hotel}`},

                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.put_feature_by_room_id}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.put_approve_new_feature}`},
                    {route_api: `${appRoutes.routes.features.base_url}${appRoutes.routes.features.put_reject_new_feature}`},
                    /**/
                    {route_api: `${appRoutes.routes.knowledge_base.base_url}${appRoutes.routes.knowledge_base.put_category}`},
                    {route_api: `${appRoutes.routes.knowledge_base.base_url}${appRoutes.routes.knowledge_base.put_sub_category}`},
                    {route_api: `${appRoutes.routes.knowledge_base.base_url}${appRoutes.routes.knowledge_base.put_article}`},
                    {route_api: `${appRoutes.routes.email_message_template.base_url}${appRoutes.routes.email_message_template.put_template_by_id}`},
                    {route_api: `${appRoutes.routes.email_message_template.base_url}${appRoutes.routes.email_message_template.put_mail}`},

                    {route_api: `${appRoutes.routes.imp.base_url}${appRoutes.routes.imp.allow_docs_upload_imp_verified}`},

                    /*Identity Access management*/
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.update_iam_role}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.attach_policy_rule}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.update_iam_role}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.update_policy_rule}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.update_policy}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.update_iam_group}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.attach_actions_group}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.update_action_info}`},
                    {route_api: `${appRoutes.routes.xcel_token_campaign.base_url}${appRoutes.routes.xcel_token_campaign.update_xcel_token_campaign}`},

                    /* FAQ */
                    {route_api: `${appRoutes.routes.faq.base_url}${appRoutes.routes.faq.update_faq_subtitle}`},

                ],
                [roleConfig.independent_marketing_partner]: [
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.put_user_account}`},
                    /*PUT properties By  imp*/
                    /**/
                    {route_api: `${appRoutes.routes.emergency_contact_info.base_url}${appRoutes.routes.emergency_contact_info.update_by_id}`},
                    {route_api: `${appRoutes.routes.near_tourist_destinations.base_url}${appRoutes.routes.near_tourist_destinations.update_by_id}`},
                ],
                [roleConfig.enduser]: [
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.put_user_account}`},
                    {route_api: `${appRoutes.routes.emergency_contact_info.base_url}${appRoutes.routes.emergency_contact_info.update_by_id}`},
                ],
                [roleConfig.vendor]: [
                    /*PUT properties By  hotel admin*/
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.put_user_account}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_property_photo_by_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_property_document_by_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_basic_info}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_basic_info_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_feature_type}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_gallery_image_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_gallery_order}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_room_order}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_property_renovation}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_property_step}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.put_photos_by_room_id}`},
                    {route_api: `${appRoutes.routes.near_tourist_destinations.base_url}${appRoutes.routes.near_tourist_destinations.update_by_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.put_feature_by_room_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.put_detail_by_id}`},
                    /**/
                    {route_api: `${appRoutes.routes.property_news.base_url}${appRoutes.routes.property_news.put_news}`},
                    {route_api: `${appRoutes.routes.food_beverages.base_url}${appRoutes.routes.food_beverages.put}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_property_aggrement}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_room_price_by_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_payment_and_policies}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.put_room_taxes}`},
                    {route_api: `${appRoutes.routes.vendor.base_url}${appRoutes.routes.vendor.put_vendor}`},
                    {route_api: `${appRoutes.routes.vendor.base_url}${appRoutes.routes.vendor.put_season}`},
                    {route_api: `${appRoutes.routes.offer_management.base_url}${appRoutes.routes.offer_management.put_coupon}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.put_room_rate_plan}`},
                    {route_api: `${appRoutes.routes.room_inventory.base_url}${appRoutes.routes.room_inventory.room_inventory_update}`},

                    {route_api: `${appRoutes.routes.room_inventory.base_url}${appRoutes.routes.room_inventory.room_pricing}`},
                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.put_contact_details}`},
                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.put_bank_account_details}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.assigncancellationpolicy_detail}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.set_policy_default}`},
                    {route_api: `${appRoutes.routes.tax.base_url}${appRoutes.routes.tax.put_tax}`},

                ]
            },
            PATCH: {
                common: [
                    {route_api: `${appRoutes.routes.notification.base_url}${appRoutes.routes.notification.update}`},
                    {route_api: `${appRoutes.routes.notification.base_url}${appRoutes.routes.notification.update_read_status}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.mobile_remove}`},
                    {route_api: `${appRoutes.routes.notification.base_url}${appRoutes.routes.notification.read_all}`},
                ],
                [roleConfig.superadmin]: [
                    {route_api: `${appRoutes.routes.email_template.base_url}${appRoutes.routes.email_template.delete}`},
                    {route_api: `${appRoutes.routes.support.base_url}${appRoutes.routes.support.delete_by_id}`},
                    {route_api: `${appRoutes.routes.html_static_content.base_url}${appRoutes.routes.html_static_content.delete_by_id}`},

                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.delete_by_id}`},
                    /*PATCH properties By  superuser*/
                    /**/
                    {route_api: `${appRoutes.routes.knowledge_base.base_url}${appRoutes.routes.knowledge_base.patch_category}`},
                    {route_api: `${appRoutes.routes.knowledge_base.base_url}${appRoutes.routes.knowledge_base.patch_sub_category}`},
                    {route_api: `${appRoutes.routes.push_notification.base_url}${appRoutes.routes.push_notification.delete_message}`},

                    /*Identity Access management*/
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.delete_iam_role}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.remove_policy_rule}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.delete_iam_group}`},
                    {route_api: `${appRoutes.routes.identity_access_management.base_url}${appRoutes.routes.identity_access_management.remove_action_info}`},

                ],
                [roleConfig.independent_marketing_partner]: [
                    /*PATCH properties By  imp*/
                    /**/
                    {route_api: `${appRoutes.routes.emergency_contact_info.base_url}${appRoutes.routes.emergency_contact_info.delete_by_id}`},
                    {route_api: `${appRoutes.routes.near_tourist_destinations.base_url}${appRoutes.routes.near_tourist_destinations.delete_by_id}`},
                ],
                [roleConfig.enduser]: [
                    {route_api: `${appRoutes.routes.emergency_contact_info.base_url}${appRoutes.routes.emergency_contact_info.delete_by_id}`},],
                [roleConfig.vendor]: [
                    /*PATCH properties By  hotel admin*/
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.patch_property_document_by_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.patch_property_image_by_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.patch_photos_by_room_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.patch_room_status}`},
                    {route_api: `${appRoutes.routes.near_tourist_destinations.base_url}${appRoutes.routes.near_tourist_destinations.delete_by_id}`},
                    {route_api: `${appRoutes.routes.offer_management.base_url}${appRoutes.routes.offer_management.patch_coupon}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.patch_room_rate_plan_id}`},
                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.patch_contact_details}`},
                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.patch_bank_account_details}`},
                    {route_api: `${appRoutes.routes.tax.base_url}${appRoutes.routes.tax.patch_tax}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.patch_gallery_image_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.patch_gallery_image}`},
                    {route_api: `${appRoutes.routes.property_offer.base_url}${appRoutes.routes.property_offer.patch_status}`},

                    /**/
                ]
            },
            DELETE: {
                common: [
                    {route_api: `${appRoutes.routes.auth_token.base_url}${appRoutes.routes.auth_token.delete_all}`},
                    {route_api: `${appRoutes.routes.auth_token.base_url}${appRoutes.routes.auth_token.delete_by_id}`},
                    {route_api: `${appRoutes.routes.html_editor.base_url}${appRoutes.routes.html_editor.delete_file}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.log_out}`},
                    {route_api: `${appRoutes.routes.social_link.base_url}${appRoutes.routes.social_link.unlink_facebook}`},
                    {route_api: `${appRoutes.routes.social_link.base_url}${appRoutes.routes.social_link.unlink_google}`},
                    {route_api: `${appRoutes.routes.social_link.base_url}${appRoutes.routes.social_link.unlink_linkedin}`},
                    {route_api: `${appRoutes.routes.social_link.base_url}${appRoutes.routes.social_link.unlink_twitter}`},
                    {route_api: `${appRoutes.routes.user_profile.base_url}${appRoutes.routes.user_profile.delete_bank_account_doc}`},

                ],
                [roleConfig.superadmin]: [
                    {route_api: `${appRoutes.routes.error_logs.base_url}${appRoutes.routes.error_logs.delete_all}`},
                    {route_api: `${appRoutes.routes.error_logs.base_url}${appRoutes.routes.error_logs.delete_by_id}`},
                    {route_api: `${appRoutes.routes.site_analytics.base_url}${appRoutes.routes.site_analytics.delete_file}`},
                    {route_api: `${appRoutes.routes.email_template.base_url}${appRoutes.routes.email_template.delete_file}`},
                    {route_api: `${appRoutes.routes.food_beverages.base_url}${appRoutes.routes.food_beverages.post}`},
                    {route_api: `${appRoutes.routes.food_beverages.base_url}${appRoutes.routes.food_beverages.delete}`},

                    /*DELETE properties By  superuser*/
                    /**/
                ],
                [roleConfig.independent_marketing_partner]: [
                    /*DELETE properties By  imp*/
                    /**/
                ],
                [roleConfig.enduser]: [],
                [roleConfig.vendor]: [
                    /*DELETE properties By  hotel admin*/
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.delete_property_document_by_name}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.delete_property_image_delte}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.delete_photos_by_room_id}`},
                    {route_api: `${appRoutes.routes.property.base_url}${appRoutes.routes.property.delete_property_photo_by_id}`},
                    {route_api: `${appRoutes.routes.food_beverages.base_url}${appRoutes.routes.food_beverages.post}`},
                    {route_api: `${appRoutes.routes.food_beverages.base_url}${appRoutes.routes.food_beverages.delete}`},
                    {route_api: `${appRoutes.routes.rules_and_regulations.base_url}${appRoutes.routes.rules_and_regulations.deleteRule}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.get_detail_by_id}`},
                    {route_api: `${appRoutes.routes.room_type.base_url}${appRoutes.routes.room_type.delete_room_rate_plan_id}`},
                    {route_api: `${appRoutes.routes.rules_and_regulations.base_url}${appRoutes.routes.rules_and_regulations.surchargedetail}`},
                    {route_api: `${appRoutes.routes.hotel_detail.base_url}${appRoutes.routes.hotel_detail.delete_contact_details}`},


                    /**/
                ]
            }
        },

    };

})();
