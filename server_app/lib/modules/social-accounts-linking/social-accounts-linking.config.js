/**
 * Created by lakhe on 9/18/17.
 */

(() => {
    "use strict";

    module.exports = {
        message: {
            facebook_link_success: "Facebook account linked successfully",
            twitter_link_success: "Twitter account linked successfully",
            linkedin_link_success: "Linkedin account linked successfully",
            google_link_success: "Google account linked successfully",
            facebook_unlink_success: "Facebook account unlinked successfully",
            twitter_unlink_success: "Twitter account unlinked successfully",
            linkedin_unlink_success: "Linkedin account unlinked successfully",
            google_unlink_success: "Google account unlinked successfully",
            facebook_link_failure: "Facebook account linked failure",
            twitter_link_failure: "Twitter account linked failure",
            linkedin_link_failure: "Linkedin account linked failure",
            google_link_failure: "Google account linked failure",
            facebook_unlink_failure: "Facebook account unlinked failure",
            twitter_unlink_failure: "Twitter account unlinked failure",
            linkedin_unlink_failure: "Linkedin account unlinked failure",
            google_unlink_failure: "Google account unlinked failure",
            wrong_access_token_facebook: "Invalid access token for facebook",
            wrong_access_token_twitter: "Invalid access token for twitter",
            wrong_access_token_linkedin: "Invalid access token for linkedin",
            wrong_access_token_google: "Invalid access token for google",
            facebook_account_already_linked: "Facebook account already linked",
            twitter_account_already_linked: "Twitter account already linked",
            linkedin_account_already_linked: "Linkedin account already linked",
            google_account_already_linked: "Google account already linked",
            termsConditionsAcceptFailure: "OOPS! Something went wrong while accepting terms and conditions. Please try it again later.",
            termsAndConditionsAlreadyAccepted: "Terms and conditions already accepted",
            already_exists_account: "Specified social account already associated with another account",
            terms_accept_issue: "Please accept terms and conditions and also update user password",
            socialAuthFailed: "Social Account authentication failed."
        },
        config: {
            facebook_request_url: "https://graph.facebook.com/v2.10/me?access_token=%access_token%",
            twitter_request_url: "https://api.twitter.com/1.1/account/verify_credentials.json?include_entities=true&include_email=true",
            linkedin_request_url: "https://api.linkedin.com/v1/people/~:(%fields%)?oauth2_access_token=%access_token%",
            google_request_url: "https://www.googleapis.com/oauth2/v2/userinfo?access_token=%access_token%",
            google_exchange_oauth_for_token_url: "https://www.googleapis.com/oauth2/v4/token?client_id=%client_id%&client_secret=%client_secret%&grant_type=%grant_type%&code=%code%",
            linkedin_exchange_oauth_for_token_url: "https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=%code%&redirect_uri=%redirect_uri%&client_id=%client_id%&client_secret=%client_secret%",
            facebook_scope_permissions: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'photos', 'about', 'birthday', 'first_name', 'last_name'],
            twitter_scope_permissions: [],
            google_scope_permissions: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.me', 'email', 'profile'],
            linkedin_scope_permissions: ['r_basicprofile', 'r_emailaddress'],
            linkedin_fields: ['id', 'first-name', 'last-name', 'date-of-birth', 'headline', 'positions', 'formatted-name', 'picture-url', 'email-address', 'public-profile-url', 'api-standard-profile-request'],
            account_types: {
                FACEBOOK: 'facebook',
                TWITTER: 'twitter',
                LINKEDIN: 'linkedin',
                GOOGLE: 'google',
            },
            twitterUniqueNonceLength: 34
        },
        oauthConfig: {
            facebook : {
                app_id:  '1409645502492063',
                app_secret: '9780aee74013922d8134646397d08388',
                callback_url: 'https://api.xceltrip.com:4000/api/login/facebook/callback'
            },
            twitter : {
                app_id:  'toMCVt1Pf42PCBUBLP2r606Jm',
                app_secret: 'op7BkOkRhmIzTXKVbucPMEJsefuRnjmfF2Om6k5ifOWR56c8FN',
                accessToken: '537319080-96SkYKEPiLnMSX0m69jqWP8CMHUD2mANPrvwYHht',
                accessTokenSecret: 'itrFfVb1NPOYJ5NkezSBSxuIfloZdRo28T8yLcSDbOQtW',
                callback_url: 'https://api.xceltrip.com:4000/api/login/twitter/callback'
            },
            linkedin : {
                app_id:  '81n67gesa75m7h',
                app_secret: 'O5enhUxTZ7WZsDYR',
                callback_url: 'https://api.xceltrip.com:4000/api/login/linkedin/callback'
            },
            googleplus : {
                app_id:  '632673995527-997dv6bet048loapcqgtfpfbqubslr2l.apps.googleusercontent.com',
                app_secret: 'ssSvCGrfLzPSjAg_D1BvF0Bg',
                callback_url: 'https://api.xceltrip.com:4000/api/login/googleplus/callback'
            },
            googleAndroid: {
                app_id:  '632673995527-tq9hi0umtqbvttjmsub4jgh8ccbbit7f.apps.googleusercontent.com',
                callback_url: 'https://api.xceltrip.com:4000/api/login/googleplus/callback'
            }
        }
    };

})();
