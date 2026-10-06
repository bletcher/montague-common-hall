import { getPayload } from 'payload'

import config from '@payload-config'

export const getClient = () => getPayload({ config })

export const getSettings = async () => (await getClient()).findGlobal({ slug: 'site-settings', depth: 0 })
