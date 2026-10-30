/**
 * The disclaimer copy both surfaces show: the plugin's settings page and the
 * standalone/desktop console.
 *
 * The product carries no WorkBuddy and no Huawei Cloud channel. Those two are
 * excluded mechanically (`src/magpie-policy.js`, and the aggregate registry
 * through it), but an exclusion with no explanation leaves a user wondering
 * whether the channel is broken. This copy answers the two questions that
 * matter instead: those channels are not part of what this build offers, and
 * anything a user does with a channel is their own responsibility.
 *
 * The copy is data, not markup: each surface renders it in its own idiom, so
 * there is exactly one place to change what the product says. It is deliberately
 * short — a wall of legal text is read by nobody — and states the project's
 * purpose plainly, because that is the honest description of what it is.
 */

export const DISCLAIMER_VERSION = 2

/** Channels this build does not offer, named for the reader. */
export const EXCLUDED_CHANNELS = Object.freeze([
  'WorkBuddy domestic version (workbuddy, also known as CodeBuddy)',
  'WorkBuddy International Version (workbuddy-ai)',
  'Huawei Cloud Huawei Cloud MaaS (huaweicloud, including Token Plan)',
])

export const DISCLAIMER = Object.freeze({
  version: DISCLAIMER_VERSION,
  title: 'Instructions for use and disclaimer',
  subtitle: 'About the channels not provided by this plug-in and the boundaries of responsibilities you need to know',
  intro: 'This plug-in is a personal learning and technical research project, used to learn the implementation of model gateways, protocol adaptation, and local routing. It is provided "as is" and does not constitute any commercial service or product commitment.',
  sections: Object.freeze([
    {
      id: 'excluded',
      heading: 'This plug-in does not provide these three channels',
      body: 'This plug-in does not include or provide WorkBuddy domestic version (workbuddy, also known as CodeBuddy), WorkBuddy international version (workbuddy-ai), and Huawei Cloud MaaS (huaweicloud, including Token Plan). These three have been removed on both the plug-in and desktop sides: they will not appear in the channel list, presets, login portal, plug-in market, and model directory, and cannot be enabled by importing configurations or installing third-party plug-ins. Not seeing them in the directory is not a glitch, it is a clear trade-off for this project and will not be reintroduced in subsequent updates.',
    },
    {
      id: 'responsibility',
      heading: 'The use of third-party channels has nothing to do with us',
      body: 'If you use the above channels or other third-party services in any way outside of this plug-in, including configuring your own address, importing credentials, installing third-party software, or logging into other people\'s accounts, it is your personal behavior and has nothing to do with the author and team of this project. We do not participate in, endorse, provide support for, and are not responsible for its availability, compliance, or any consequences.',
    },
    {
      id: 'accounts',
      heading: 'You are responsible for your account and credentials',
      body: 'This plug-in only saves the credentials you actively import on your local machine and will not upload them to any server. Please ensure that the way you use these accounts complies with the terms of the corresponding service provider and local laws; any resulting bans, deductions, data risks or other losses will be borne by the user.',
    },
    {
      id: 'no-warranty',
      heading: 'No guarantee is provided',
      body: 'This project does not make any express or implied warranties of correctness, stability, merchantability, or fitness for a particular purpose. The author and team are not responsible for any direct or indirect losses caused by the use of this plug-in. Please evaluate the risks yourself and give priority to complying with the laws, regulations and service provider agreements in your region.',
    },
    {
      id: 'lawful',
      heading: 'Please use it legally and compliantly',
      body: 'This project is for personal study and technical research only. Please do not use it to violate service provider terms, circumvent authorization restrictions, batch abuse quotas, or other illegal purposes. Any disputes, claims or legal liabilities arising from improper use shall be borne by the user himself.',
    },
  ]),
  accept: 'I have read and understood',
  reopen: 'View disclaimer',
})

/** Whether a stored acknowledgement matches the current copy version. */
export function disclaimerAcknowledged(settings) {
  return Number(settings?.disclaimerAck) === DISCLAIMER_VERSION
}
