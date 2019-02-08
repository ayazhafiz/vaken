import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import styled from 'styled-components';
import FloatingPopup from '../../components/Containers/FloatingPopup';
import { FlexRow, FlexColumn } from '../../components/Containers/FlexContainers';
import Sidebar from '../../components/Sidebar/Sidebar';
import 'chartjs-plugin-datalabels';
import TextButton from '../../components/Buttons/TextButton';
import STRINGS from '../../assets/strings.json';
import Title from '../../components/Text/Title';

const Layout = styled.div`
	height: 100vh;
	width: 100vw;
	display: grid;
	grid-gap: 2rem;
	grid:
		'sidebar header' 10vh
		'sidebar content-top' 1fr
		'sidebar content-bottom' 1fr
		/ 18rem 1fr;
	align-items: 'stretch';
`;

const Rectangle = styled.div`
	height: 0.4rem;
	width: 7.5rem;
	background: ${STRINGS.ACCENT_COLOR};
`;

const colorPalette = ['#DBA5F5', '#FFC7A6', '#FFE29D', '#7DDFC3', '#A5AFFB', '#FDAFBB'];

const Dashboard = (): JSX.Element => {
	const generateColor = (n: number) =>
		[...Array(n).keys()].map((i: number) => colorPalette[i % colorPalette.length]);

	const statusLabels = ['Verified', 'Started', 'Submitted', 'Accepted', 'Confirmed', 'Rejected'];
	const statusData = [22, 43, 230, 176, 89, 3];

	const shirtLabels = ['Unisex S', 'Unisex M', 'Unisex L', "Women's S", "Women's M", "Women's L"];
	const shirtData = [83, 40, 58, 60, 23, 51];

	const genderLabels = ['Female', 'Male', 'Non-Binary', 'Prefer Not to Say'];
	const genderData = [49, 73, 12, 23];

	const barStatusData = {
		datasets: [
			{
				backgroundColor: generateColor(statusData.length),
				data: statusData,
			},
		],
		labels: statusLabels,
	};

	const barStatusOptions = {
		legend: {
			display: false,
		},
		responsive: true,
		maintainAspectRatio: true,
		scales: {
			xAxes: [
				{
					ticks: {
						fontSize: 20,
					},
				},
			],
		},
		showLines: true,
		title: {
			display: true,
			fontSize: 24,
			text: 'Number of Applicants',
		},
		tooltips: {
			enabled: false,
		},
		plugins: {
			datalabels: {
				font: {
					size: 20,
					weight: 'bold',
				},
				display: 'auto',
				align: 'start',
				anchor: 'end',
				color: 'black',
				clip: true,
			},
		},
	};

	const pieShirtData = {
		labels: shirtLabels,
		datasets: [
			{
				data: shirtData,
				backgroundColor: generateColor(shirtData.length),
			},
		],
	};

	const pieShirtOptions = {
		title: {
			display: true,
			fontSize: 24,
			text: 'T-Shirt Sizes',
			position: 'bottom' as 'bottom',
		},
		responsive: true,
		maintainAspectRatio: true,
		legend: {
			position: 'right' as 'right',
		},
	};

	const pieGenderData = {
		labels: genderLabels,
		datasets: [
			{
				data: genderData,
				backgroundColor: generateColor(shirtData.length),
			},
		],
	};

	const pieGenderOptions = {
		title: {
			display: true,
			fontSize: 24,
			text: 'Gender',
			position: 'bottom' as 'bottom',
		},
		responsive: true,
		maintainAspectRatio: true,
		legend: {
			position: 'right' as 'right',
		},
	};

	return (
		<>
			<Layout>
				<div style={{ gridArea: 'header' }}>
					<Title color={STRINGS.ACCENT_COLOR} margin="1.5rem 0rem 0rem">
						Dashboard
					</Title>
					<Rectangle />
				</div>
				<Sidebar />
				<FloatingPopup width="60rem" opacity={1} gridArea="content-top" padding="1.5rem">
					<Bar data={barStatusData} options={barStatusOptions} />
					<TextButton
						color="white"
						fontSize="1.4em"
						background={STRINGS.ACCENT_COLOR}
						text="Manage hackers"
						glowColor="rgba(0, 0, 255, 0.67)"
					/>
				</FloatingPopup>
				<FloatingPopup width="60rem" opacity={1} gridArea="content-bottom" padding="1.5rem">
					<FlexRow>
						<FlexColumn>
							<Pie data={pieShirtData} options={pieShirtOptions} />
						</FlexColumn>
						<FlexColumn>
							<Pie data={pieGenderData} options={pieGenderOptions} />
						</FlexColumn>
					</FlexRow>
				</FloatingPopup>
			</Layout>
		</>
	);
};

export default Dashboard;