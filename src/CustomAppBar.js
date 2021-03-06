import {
	makeStyles,
	fade,
	AppBar,
	ThemeProvider,
	Hidden,
	Toolbar,
	IconButton,
	Typography,
	Tooltip,
	InputBase,
	Paper,
	ListItemText,
	List,
	ListItem,
	SvgIcon,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import Brightness4 from "@material-ui/icons/Brightness4";
import Brightness7 from "@material-ui/icons/Brightness7";
import SearchIcon from "@material-ui/icons/Search";
import { useCallback, useEffect, useMemo, useState } from "react";
import Minehut from "../public/minehut.svg";
import Link from "./Link";
import keywords from "../keywords.json";
import routes from "../routes.json";
import { useRouter, withRouter } from "next/router";
import { debounce } from "debounce";

const useStyles = makeStyles((theme) => ({
	menuButton: {
		marginRight: theme.spacing(2),
	},
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
	},
	title: {
		color: "white",
		textDecoration: "none",
		textAlign: "center",
		padding: theme.spacing(1),
		[theme.breakpoints.down("xs")]: {
			position: "absolute",
			left: "50%",
			transform: "translateX(-50%)",
		},
	},
	empty: {
		flexGrow: 1,
	},
	search: {
		position: "relative",
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		"&:hover": {
			backgroundColor: fade(theme.palette.common.white, 0.25),
		},
		margin: 0,
		[theme.breakpoints.up("sm")]: {
			marginLeft: theme.spacing(1),
			width: "auto",
			marginRight: theme.spacing(2),
		},
		[theme.breakpoints.down("xs")]: {
			flexGrow: 1,
		},
	},
	searchIcon: {
		padding: theme.spacing(0, 2),
		height: "100%",
		position: "absolute",
		pointerEvents: "none",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "white",
	},
	input: { width: "100%" },
	inputInput: {
		padding: theme.spacing(1, 1, 1, 0),
		paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
		transition: theme.transitions.create("width"),
		width: "100%",
		[theme.breakpoints.up("sm")]: {
			width: "12ch",
			"&:focus": {
				width: "20ch",
			},
		},
	},
	paper: {
		position: "absolute",
		right: 0,
		left: 0,
		top: 35,
	},
	logo: {
		fontSize: "140%",
	},
	themeButton: {
		[theme.breakpoints.down("xs")]: {
			position: "absolute",
			right: theme.spacing(2),
		},
	},
}));

export default function CustomAppBar({
	themeConfig,
	appBarTheme,
	toggleDarkMode,
	setOpen,
	open,
}) {
	const classes = useStyles();
	const [searching, setSearching] = useState(false);
	const loaded = useLoaded();
	const [searchWord, setSearchWord] = useState("");

	const router = useRouter();

	useEffect(() => {
		if (router.query.q) {
			setSearching(true);
			setSearchWord(router.query.q);
			document.getElementById("searchBar").focus();
		}
	}, [router]);

	function getKeywords(keywords) {
		const returnKeywords = [];
		Object.keys(keywords).forEach((page) => {
			if (Array.isArray(keywords[page]))
				returnKeywords.push(...keywords[page].map((k) => [page, k]));
			else returnKeywords.push(...getKeywords(keywords[page]));
		});
		return returnKeywords;
	}

	function getRoutes(routes) {
		const returnRoutes = [];
		Object.keys(routes).forEach((route) => {
			if (typeof routes[route] === "string")
				returnRoutes.push([route, routes[route]]);
			else returnRoutes.push(...getRoutes(routes[route]));
		});
		return returnRoutes;
	}

	const mappedRoutes = getRoutes(routes);

	const filteredKeywords = getKeywords(keywords).filter(
		(k) =>
			k[1].toLowerCase().includes(searchWord.toLowerCase()) &&
			searchWord !== ""
	);

	filteredKeywords.splice(5, filteredKeywords.length - 5);

	const debouncedRoute = useCallback(
		debounce((searchWord) => {
			router.replace({
				query: removeUndefined({
					...router.query,
					q: searchWord || undefined,
				}),
			});
		}, 500),
		[router]
	);

	const list = (
		<List>
			{filteredKeywords.map((k) => (
				<ListItem
					button
					onClick={() => {
						setSearchWord("");
						setSearching(false);

						router.push({
							pathname: mappedRoutes.find(
								(r) => r[0] === k[0]
							)[1],
							query: removeUndefined({
								...router.query,
								q: undefined,
								scrollTo:
									(k[1].match(/(^|\n)### /)
										? "h3-"
										: k[1].match(/(^|\n)## /)
										? "h2-"
										: "h1-") +
									k[1]
										.replace(/(^|\n)#{1,3} /, "")
										.toLowerCase()
										.replace(/ +/g, "-"),
							}),
						});
					}}
					key={k[0] + "-" + k[1]}
				>
					<ListItemText>
						<Typography variant="subtitle1" color="textSecondary">
							{k[0]}
						</Typography>
						{k[1].toUpperCase().replace(/(^|\n)#{1,3} /, "")}
					</ListItemText>
				</ListItem>
			))}
		</List>
	);

	const search = (
		<div className={classes.search}>
			<div className={classes.searchIcon}>
				<SearchIcon />
			</div>
			<InputBase
				placeholder="Search…"
				className={classes.input}
				id="searchBar"
				classes={{
					root: classes.inputRoot,
					input: classes.inputInput,
				}}
				onChange={(e) => {
					setSearching(true);
					setSearchWord(e.target.value);
					debouncedRoute(e.target.value);
				}}
				onFocus={() => setSearching(true)}
				onBlur={(e) => {
					if (!e.nativeEvent.relatedTarget) {
						setSearching(false);
					}
				}}
				value={searchWord}
			/>
			<Paper
				className={classes.paper}
				style={{
					display:
						searching &&
						searchWord !== "" &&
						filteredKeywords.length &&
						!searchWord.match(/^ +$/) > 0
							? "inline-block"
							: "none",
				}}
			>
				{list}
			</Paper>
		</div>
	);

	return (
		<ThemeProvider theme={appBarTheme}>
			<AppBar position="fixed" color="inherit" className={classes.appBar}>
				<Toolbar>
					<Hidden lgUp>
						<IconButton
							onClick={() => setOpen(!open)}
							className={classes.menuButton}
							centerRipple={false}
						>
							<MenuIcon />
						</IconButton>
					</Hidden>
					<IconButton
						component={Link}
						href="/"
						className={classes.title}
						naked
						centerRipple={false}
					>
						<SvgIcon
							className={classes.logo}
							component={Minehut}
							viewBox="0, 0, 400,400"
						/>
					</IconButton>
					<Hidden xsDown>
						<div className={classes.empty} />
						{search}
					</Hidden>
					<Tooltip title="Toggle light/dark theme">
						<IconButton
							className={classes.themeButton}
							onClick={toggleDarkMode}
							centerRipple={false}
						>
							{loaded ? (
								themeConfig.palette.type === "light" ? (
									<Brightness4 />
								) : (
									<Brightness7 />
								)
							) : null}
						</IconButton>
					</Tooltip>
				</Toolbar>
				<Hidden smUp>
					<Toolbar>{search}</Toolbar>
				</Hidden>
			</AppBar>
		</ThemeProvider>
	);
}

function useLoaded() {
	const [loaded, setLoaded] = useState(false);
	useEffect(() => setLoaded(true), []);
	return loaded;
}

function removeUndefined(o) {
	return Object.entries(o)
		.filter(([, val]) => val !== undefined)
		.reduce((result, [key, val]) => {
			result[key] = val;
			return result;
		}, {});
}
