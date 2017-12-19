"use strict";
/*  Title: Email-api
    Author:  Hubbert
    Date: Oct 23 2016
    Comment: 
        This is the api which is used for all email stuff.
*/


function EmailApi() {
    var self = this;
    this.tag = 'email-api';
    var Promise = getPromise();
    var templates = getEmailTemplate();
    var emailTemplateDir = require('path').join(__dirname, '../../templates/email');
    var moment = getMoment();
    var transporter = getEmailTransport();

    this.sendEmployeeNewPassword = function(employee, password) {
        var admin_password_reset_template = emailTemplateDir + '/admin_password_reset/admin_password_reset.hbs';
        return new Promise(function(resolve, reject) {
            if (!employee || !password) {
                return reject('No employee or password was provided to the reset api');
            }
            var emailOptions = {
                from: '"Do-Not-Reply" <do-not-reply@counterDraft.com>',
                subject: 'New Password'
            }

            var message = { to: employee.email_address }
            var context = {
                employee: employee,
                password: password
            }
            var templateSender = transporter.templateSender({
                render: function(context, callback) {
                    templates.render(admin_password_reset_template, context, function(err, html, text) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null, {
                            html: html,
                            text: text
                        });
                    });
                }
            }, emailOptions);

            templateSender(message, context, function(err, info) {
                if (err) {
                    var eo = {
                        email_address: employee.email_address,
                        error: err
                    }
                    logger.error(self.getErrorApi().getErrorMsg(9902), { error: eo });
                    return reject(err);
                }
                logger.info('New password email sent to - ', { email_address: employee.email_address, info: info.response.toString() });
                return resolve(info);
            });
        }).catch(function(err) {
            logger.error(err.toString(), { error: err });
        });
    }

    this.inviteUser = function(email_address, organization, invitation_token) {
        var invite_user_template = emailTemplateDir + '/organization-invite/organization-invite.hbs';
        var url_link;
        return new Promise(function(resolve, reject) {
            if (!email_address || !invitation_token || !organization) {
                return reject('No email_address or invitation_token or organization was provided to the email api');
            }
            var emailOptions = {
                from: '"Do-Not-Reply" <do-not-reply@counterDraft.com>',
                subject: 'Invitation to CounterDraft'
            }
            if (global.config.environment === 'production') {
                url_link = 'https://' + config.server.ip + '/login?invitation_token=' + invitation_token;
            } else {
                url_link = 'http://' + config.server.ip + ':' + config.server.port + '/login?invitation_token=' + invitation_token;
            }
            var message = { to: email_address }
            var context = {
                url_link: url_link,
                organization: organization,
                invitation_token: invitation_token
            }
            var templateSender = transporter.templateSender({
                render: function(context, callback) {
                    templates.render(invite_user_template, context, function(err, html, text) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null, {
                            html: html,
                            text: text
                        });
                    });
                }
            }, emailOptions);

            templateSender(message, context, function(err, info) {
                if (err) {
                    var eo = {
                        email_address: email_address,
                        error: err
                    }
                    logger.error(self.getErrorApi().getErrorMsg(9902), { error: eo });
                    return reject(err);
                }
                logger.info('Reset password email sent to - ', { email_address: email_address, info: info.response.toString() });
                return resolve(info);
            });
        }).catch(function(err) {
            logger.error(err.toString(), { error: err });
        });
    }

    this.resetPassword = function(user, token) {
        var password_reset_template = emailTemplateDir + '/password_reset/password_reset.hbs';
        var url_link;
        return new Promise(function(resolve, reject) {
            if (!user || !token) {
                return reject('No user_email or token was provided to the reset api');
            }
            var emailOptions = {
                from: '"Do-Not-Reply" <do-not-reply@counterDraft.com>',
                subject: 'Reset Password'
            }
            if (global.config.environment === 'production') {
                url_link = 'https://' + config.server.ip + '/retrieve?retrieve_token=' + token + '&email_address=' + user.email_address;
            } else {
                url_link = 'http://' + config.server.ip + ':' + config.server.port + '/retrieve?retrieve_token=' + token + '&email_address=' + user.email_address;
            }
            var message = { to: user.email_address }
            var context = {
                user: user,
                url_link: url_link,
                expire_time: moment(user.retrieve_expiration).calendar()
            }
            var templateSender = transporter.templateSender({
                render: function(context, callback) {
                    templates.render(password_reset_template, context, function(err, html, text) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null, {
                            html: html,
                            text: text
                        });
                    });
                }
            }, emailOptions);

            templateSender(message, context, function(err, info) {
                if (err) {
                    var eo = {
                        email_address: user.email_address,
                        error: err
                    }
                    logger.error(self.getErrorApi().getErrorMsg(9902), { error: eo });
                    return reject(err);
                }
                logger.info('Reset password email sent to - ', { email_address: user.email_address, info: info.response.toString() });
                return resolve(info);
            });
        }).catch(function(err) {
            logger.error(err.toString(), { error: err });
        });
    }

    this.registration = function(user, token) {
        var password_reset_template = emailTemplateDir + '/registration_confirmation/registration-confirmation.hbs';
        var url_link;
        return new Promise(function(resolve, reject) {
            if (!user || !token) {
                return reject('No user_email or token was provided to the reset api');
            }

            if (global.config.environment === 'production') {
                url_link = 'http://' + config.server.ip + '/confirmation?token=' + token;
            } else {
                url_link = 'http://' + config.server.ip + ':' + config.server.port + '/confirmation?token=' + token;
            }

            var message = { to: user.email_address };

            var emailOptions = {
                from: '"Do-Not-Reply" <do-not-reply@counterDraft.com>',
                subject: 'Email Confirmation'
            }

            var context = {
                user: user,
                url_link: url_link
            }

            var templateSender = transporter.templateSender({
                render: function(context, callback) {
                    templates.render(password_reset_template, context, function(err, html, text) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null, {
                            html: html,
                            text: text
                        });
                    });
                }
            }, emailOptions);

            templateSender(message, context, function(err, info) {
                if (err) {
                    var eo = {
                        email_address: user.email_address,
                        error: err
                    }
                    logger.error(self.getErrorApi().getErrorMsg(9902), { error: eo });
                    return reject(err);
                } else {
                    logger.info('Email confirmation sent to - ', { email_address: user.email_address, info: info.response.toString() });
                    return resolve(info);
                }
            });
        }).catch(function(err) {
            logger.error(err.toString(), { error: err });
        });
    }

    this.patronRegistration = function(patron, organization) {
        var password_reset_template = emailTemplateDir + '/patron_registration_confirmation/patron_registration_confirmation.hbs';
        var url_link;
        return new Promise(function(resolve, reject) {
            if (!patron) {
                return reject('No patron was provided to the email api');
            }

            if (global.config.environment === 'production') {
                url_link = 'http://' + config.server.ip + '/login';
            } else {
                url_link = 'http://' + config.server.ip + ':' + config.server.port + '/login';
            }

            var message = { to: patron.email_address };

            var emailOptions = {
                from: '"Do-Not-Reply" <do-not-reply@counterDraft.com>',
                subject: 'Patron Registration Confirmation'
            }

            var context = {
                user: patron,
                url: url_link,
                organization: organization
            }

            var templateSender = transporter.templateSender({
                render: function(context, callback) {
                    templates.render(password_reset_template, context, function(err, html, text) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null, {
                            html: html,
                            text: text
                        });
                    });
                }
            }, emailOptions);

            templateSender(message, context, function(err, info) {
                if (err) {
                    var eo = {
                        email_address: patron.email_address,
                        error: err
                    }
                    logger.error(self.getErrorApi().getErrorMsg(9902), { error: eo });
                    return reject(err);
                } else {
                    logger.info('Email patron registration confirmation sent to - ', { email_address: patron.email_address, info: info.response.toString() });
                    return resolve(info);
                }
            });
        }).catch(function(err) {
            logger.error(err.toString(), { error: err });
        });
    }
}

module.exports = EmailApi;
