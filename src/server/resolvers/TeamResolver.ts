import { Resolver, Query, Arg, Mutation } from 'type-graphql';

import { User } from '../data/User';
import { Team } from '../data/Team';

import { teamModel } from '../models/Team';
import { hackerModel } from '../models/Hacker';

@Resolver()
class TeamResolver {
	/**
	 * @param {string} email - email address of the user to add to a team
	 * @param {string} teamName - name of the team to which to add the user
	 * @returns {boolean} true if successful
	 */
	@Mutation(() => Boolean, {
		description: 'Add a Hacker to a team',
	})
	public async addHackerToTeam(
		@Arg('email', { nullable: false }) email: string,
		@Arg('teamName') teamName: string
	): Promise<boolean> {
		// Make sure the team and hacker exist
		const team = await teamModel.findOne({ teamName: teamName });
		const hacker = await hackerModel.findOne({ email: email });

		// If the hacker doesn't exist, throw an error
		if (!hacker) {
			throw new Error('Hacker does not exist!');
		}

		// If the team doesn't exist, create it
		if (!team) {
			try {
				await teamModel.create({ teamMembers: [], teamName: teamName });
			} catch (err) {
				throw new Error('Team could not be created!');
			}
		}

		// Add the Hacker to the team; this should handle a team size error
		try {
			teamModel.findOneAndUpdate(
				{ teamName: teamName },
				{ $push: { teamMembers: hacker } },
				{ new: true }
			);

			hacker.update({
				teamName: teamName,
			});
		} catch (err) {
			throw new Error('Hacker could not be added to team!');
		}

		return true;
	}

	/**
	 * @param {string} email - email address of the user to add to a team
	 * @param {string} teamName - name of the team to which to add the user
	 * @returns {Status} new status of user or null if the hacker doesn't exist
	 */
	@Mutation(() => Boolean, {
		description: 'Remove a Hacker from a team',
	})
	public async removeHackerFromTeam(
		@Arg('email', { nullable: false }) email: string,
		@Arg('teamName') teamName: string
	): Promise<boolean> {
		const team = await teamModel.findOne({ teamName: teamName });
		const hacker = await hackerModel.findOne({ email: email });

		if (!team) {
			throw new Error('Team does not exist!');
		} else if (!hacker) {
			throw new Error('Hacker does not exist!');
		} else if (!team.teamMembers.includes(hacker)) {
			throw new Error('Hacker is not on this Team!');
		} else {
			try {
				// Remove Hacker from team
				teamModel.findOneAndUpdate({ teamName: teamName }, { $pull: { teamMembers: hacker } });

				// Remove teamName from Hacker's profile
				hacker.update({
					teamName: undefined,
				});

				// If the team is now empty, delete it
				if (teamModel.size === 0) {
					teamModel.findOneAndDelete({ teamName: teamName });
				}
			} catch (err) {
				throw err;
			}
		}

		return true;
	}

	/**
	 * @param {string} teamName - email address of a particular user
	 * @returns {number} Size of the team
	 */
	@Query(() => Number, {
		description: 'Return the size of a Team',
		nullable: true,
	})
	public async getTeamSize(@Arg('teamName') teamName: string): Promise<number> {
		const team = await teamModel.findOne({ teamName: teamName });

		if (!team) {
			throw new Error('Team does not exist!');
		} else {
			return team.size;
		}
	}

	/**
	 * @param {string} teamName - name of the team to
	 * @returns {Promise<void>} Promise to Team is created or undefined if team existed
	 */
	// 	@Mutation(() => Promise, {
	// 		description: 'Create a Team',
	// 	})
	// 	private async createTeam(@Arg('teamName') teamName: string): Promise<void> {
	// 		const team = await teamModel.findOne({ teamName: teamName });

	// 		// If a team already exists, throw an error
	// 		if (team) {
	// 			throw new Error('Team already exists!');
	// 		}

	// 		// Create a team, throwing an exception if that fails
	// 		try {
	// 			await teamModel.create({ teamMembers: [], teamName: teamName });
	// 		} catch (err) {
	// 			throw err;
	// 		}
	// 	}
}

export default TeamResolver;

// Copyright (c) 2019 Vanderbilt University
