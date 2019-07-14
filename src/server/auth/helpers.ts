import { VerifyCallback } from 'passport-oauth2';
import { Profile } from 'passport';
import { ObjectID } from 'mongodb';
import { UserDbInterface, UserType, ApplicationStatus, SponsorStatus } from '../generated/graphql';
import DB, { Models } from '../models';
import { fetchUser } from '../resolvers/helpers';
import logger from '../logger';

export async function getUserFromDb(email: string, userType?: string): Promise<UserDbInterface> {
	const { Hackers, Organizers, Sponsors } = await DB.collections();

	let user: UserDbInterface | null = null;
	switch (userType) {
		case UserType.Hacker:
			user = await Hackers.findOne({ email });
			break;
		case UserType.Organizer:
			user = await Organizers.findOne({ email });
			break;
		case UserType.Sponsor:
			user = await Sponsors.findOne({ email });
			break;
		default:
			throw new Error(`invalid userType '${userType}'`);
	}

	if (!user) {
		throw new Error(`couldn't find user (${user}) with email ${email}`);
	}

	return user;
}

export const verifyCallback = async (
	models: Models,
	profile: Profile,
	done: VerifyCallback
): Promise<void> => {
	const { Logins, Hackers } = models;

	let { userType } = (await Logins.findOne({
		provider: profile.provider,
		token: profile.id,
	})) || { userType: null };

	try {
		const { emails: [{ value: email }] = [{ value: null }] } = profile;
		if (email == null) {
			throw new Error(`Email not provided by provider ${profile}`);
		}

		if (userType == null) {
			// before checking hacker check if it is a whitelist sponsor
			const verifySponsor = await Sponsors.findOne({ email });
			if (verifySponsor != null) {
				// it is a sponsor and change the status of the sponsor
				await Logins.insertOne({
					createdAt: new Date(),
					email,
					provider: profile.provider,
					token: profile.id,
					userType: UserType.Sponsor,
				});
				// useSponsorStatusMutation({
				// 	variables: { input: { email, status: SponsorStatus.Created } }
				// });
				await Sponsors.findOneAndUpdate(
					{ email },
					{ $set: { status: SponsorStatus.Created } },
					{ returnOriginal: false }
				);
				userType = UserType.Sponsor;
			} else {
				await Logins.insertOne({
					createdAt: new Date(),
					email,
					provider: profile.provider,
					token: profile.id,
					userType: UserType.Hacker,
				});

				logger.info(`inserting user ${email}`);
				await Hackers.insertOne({
					_id: new ObjectID(),
					createdAt: new Date(),
					dietaryRestrictions: [],
					email,
					firstName: 'New',
					lastName: 'User',
					logins: [],
					majors: [],
					modifiedAt: new Date().getTime(),
					phoneNumber: '',
					preferredName: '',
					race: [],
					secondaryIds: [],
					status: ApplicationStatus.Created,
					userType: UserType.Hacker,
				});
			}
		}

		const user = await fetchUser({ email, userType: userType || UserType.Hacker }, models);
		// const user = await getUserFromDb(email, userType || UserType.Hacker);
		return void done(null, user);
	} catch (err) {
		return void done(err);
	}
};

export default {
	verifyCallback,
};
