(() => {
    "use strict";

    module.exports = {
        message: {
            saveMessage: "Email message template saved successfully",
            updateMessage: "Email message template updated successfully",
            deleteMessage: "Email message template deleted successfully",
            notFound: "Email message template not found",
            fieldRequired: "Email message template title is required",
            alreadyExists: "Email message template with same title already exists",
            documentRemove: 'Document removed successfully',
            fileSelect: 'Please provide file name as query string value or the file doesn\'t exist on the system',
            invalidCase: "Provide Valid Case",
            mailSent: "Mail Send Successfully",
            validationErrMessage: {
                template_name: "Email message template title is required",
                email_subject: "Subject of email is required",
                template_content: "Content for Email template is required",
                case: "Template Case is Required"
            }
        },
        cases: {
            adminToUser: {
                title: "Message by Admin To User",
                variable: [{user_first_name: 'First Name of User'}, {user_last_name: 'Last Name of User'}, {user_email: 'User Email'}]
            },
            adminToVendor: {
                title: 'Message by Admin To Property',
                variable: [{vendor_first_name: 'First Name of Property'}, {vendor_last_name: 'Last Name of Property'}, {vendor_email: 'Property Email'}]
            },
            adminToIMP: {
                title: 'Message by Admin To IMP',
                variable: [{imp_first_name: 'First Name of IMP'}, {imp_last_name: 'Last Name of IMP'}, {imp_email: 'IMP Email'}]
            },
            adminToImpOfVendor: {
                title: 'Message by Admin To Imp Of Property',
                variable: [{vendor_name: 'Name of Property'},{imp_first_name: 'First Name of IMP'}, {imp_last_name: 'Last Name of IMP'}, {imp_email: 'IMP Email'},{vendor_first_name: 'First Name of Contact Person of Property'}, {vendor_last_name: 'Last Name Contact Person of Property'}, {vendor_email: 'Property Email'}]
            },
            adminToImpOfImp: {
                title: 'Message by Admin To "Referee Imp" of "Referral Imp"',
                variable: [{referee_imp_first_name: 'First Name of Referee IMP'}, {referee_imp_last_name: 'Last Name of Referee IMP'}, {referee_imp_email: 'Referee IMP Email'},{referral_imp_first_name: 'First Name of Referral IMP'}, {referral_imp_last_name: 'Last Name of Referral IMP'}, {referral_imp_email: 'IMP Referral Email'}]
            }
        },
        config: {
            documentFilePath: '/private-uploads/email-message-templates/',
            uploadPrefix: 'email-message-template'
        }
    };

})();
