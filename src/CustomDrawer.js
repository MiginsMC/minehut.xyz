import React from "react";
import {
	Drawer,
	Toolbar,
	List,
	ListItem,
	ListItemText,
	Collapse,
	Hidden,
	SwipeableDrawer,
	ListSubheader,
} from "@material-ui/core";
import Link from "../src/Link";
import { makeStyles } from "@material-ui/core/styles";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import { useRouter } from "next/router";
import routes from "../routes.json";

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
	drawer: {
		width: drawerWidth,
		maxWidth: "100%",
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		maxWidth: "100%",
	},
	drawerContainer: {
		overflowY: "auto",
		overflowX: "hidden",
	},
	subheader: {
		marginTop: theme.spacing(2),
		backgroundColor: theme.palette.background.paper,
	},
}));

export default function CustomDrawer({ open, setOpen }) {
	const dropdowns = {};

	function setStates(routes) {
		Object.keys(routes).forEach((route) => {
			if (typeof routes[route] !== "object") return;
			const [open, setOpen] = React.useState(false);
			dropdowns[route] = {};
			dropdowns[route].open = open;
			dropdowns[route].setOpen = setOpen;
			setStates(routes[route]);
		});
	}

	setStates(routes);

	const router = useRouter();

	function mapRoutes(routes, i) {
		return Object.keys(routes).map((route, index) => {
			if (typeof routes[route] === "string") {
				return (
					<ListItem
						button
						component={Link}
						naked
						href={routes[route]}
						key={routes[route]}
						selected={router.asPath.split("#")[0] === routes[route]}
						onClick={() => setOpen(false)}
					>
						<ListItemText
							style={{
								marginLeft: `${Math.max(i - 1, 0) * 32}px`,
							}}
						>
							{route}
						</ListItemText>
					</ListItem>
				);
			} else {
				if (i === 0)
					return (
						<div key={route + "-div"}>
							<ListSubheader
								className={classes.subheader}
								key={route}
							>
								<strong>{route.toUpperCase()}</strong>
							</ListSubheader>
							{mapRoutes(routes[route], i + 1)}
						</div>
					);
				else
					return (
						<div key={route + "-div"}>
							<ListItem
								button
								onClick={() => {
									dropdowns[route].setOpen(
										!dropdowns[route].open
									);
								}}
								key={route}
							>
								<ListItemText
									style={{
										marginLeft: `${
											Math.max(i - 1, 0) * 32
										}px`,
									}}
								>
									{route}
								</ListItemText>
								{dropdowns[route].open ? (
									<ExpandLess />
								) : (
									<ExpandMore />
								)}
							</ListItem>
							<Collapse
								key={route + "-dropdown"}
								in={dropdowns[route].open}
							>
								{mapRoutes(routes[route], i + 1)}
							</Collapse>
						</div>
					);
			}
		});
	}

	const classes = useStyles();

	const drawer = (
		<div className={classes.drawerContainer}>
			<List>{mapRoutes(routes, 0)}</List>
		</div>
	);

	return (
		<>
			<Hidden mdDown>
				<Drawer
					className={classes.drawer}
					variant="permanent"
					classes={{
						paper: classes.drawerPaper,
					}}
					anchor="left"
				>
					<Toolbar />
					{drawer}
				</Drawer>
			</Hidden>
			<Hidden lgUp>
				<SwipeableDrawer
					className={classes.drawer}
					variant="temporary"
					open={open}
					onClose={() => setOpen(false)}
					onOpen={() => setOpen(true)}
					classes={{
						paper: classes.drawerPaper,
					}}
					anchor="left"
				>
					{drawer}
				</SwipeableDrawer>
			</Hidden>
		</>
	);
}
