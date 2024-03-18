import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Button,
  IconButton,
  Stack,
} from "@mui/material";
import { Inbox, Mail, ArrowForwardIos, Add, Close } from "@mui/icons-material";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import "./App.css";
import { ReactElement, ReactNode, SyntheticEvent, useState } from "react";
import SimpleDialog from "./Modal";

interface StyledTabsProps {
  children?: ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  scrollButtons?: boolean | "auto";
  variant?: "scrollable" | "standard" | "fullWidth";
}

interface StyledTabProps {
  label: string | ReactNode;
  icon?: ReactElement;
  iconPosition?: "bottom" | "start" | "end";
  value: number;
}

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

interface RepoTab {
  id: number;
  name: string;
  repoPath?: string;
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const drawerWidth = 180;

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ display: "flex" }}>{children}</Box>}
    </div>
  );
};
const StyledTabs = styled((props: StyledTabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))({
  "& .MuiTabs-indicator": {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  "& .MuiTabs-indicatorSpan": {
    width: "100%",
    backgroundColor: "#635ee7",
  },
});

const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: "none",
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  color: "rgba(255, 255, 255, 0.7)",
  "&.Mui-selected": {
    color: "#fff",
  },
  "&.Mui-focusVisible": {
    backgroundColor: "rgba(100, 95, 228, 0.32)",
  },
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
}));

function App() {
  const [selectedTab, setSelectedTab] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [tabs, setTabs] = useState<RepoTab[]>([{ id: 1, name: "New Tab" }]);

  const handleSelectedTab = (_: SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const addNewTab = () =>
    setTabs([
      ...tabs,
      {
        id: tabs.length + 1,
        name: "New Tab",
      },
    ]);
  const deleteTab = (event: SyntheticEvent, tab: RepoTab) => {
    event.stopPropagation();

    const tabsCopy = [...tabs];
    const foundindex = tabsCopy.findIndex((x) => x.id === tab.id);

    if (!foundindex) return;

    tabsCopy.splice(foundindex, 1);

    setTabs(tabsCopy);

    if (tab.id === selectedTab) {
      setSelectedTab(tabsCopy[tabsCopy.length - 1].id);
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <ThemeProvider theme={darkTheme}>
      <Box>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <Typography>RustyGitTree</Typography>
            <StyledTabs
              value={selectedTab}
              onChange={handleSelectedTab}
              scrollButtons="auto"
              variant="scrollable"
            >
              {tabs.map((x) => (
                <StyledTab
                  value={x.id}
                  key={x.id}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography>{x.name}</Typography>
                      {tabs.length !== 1 ? (
                        <Close
                          className="closeButton"
                          fontSize="inherit"
                          onClick={(e) => deleteTab(e, x)}
                        />
                      ) : null}
                    </Box>
                  }
                />
              ))}
            </StyledTabs>
            <IconButton onClick={addNewTab}>
              <Add />
            </IconButton>
          </Toolbar>
        </AppBar>

        {tabs.map((tab) => (
          <TabPanel value={selectedTab} index={tab.id} key={tab.id}>
            {tab.repoPath ? (
              <>
                <Box
                  component="nav"
                  sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                >
                  <Drawer
                    variant="permanent"
                    sx={{
                      display: { xs: "none", sm: "block" },
                      [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: "border-box",
                      },
                    }}
                  >
                    <Toolbar />
                    <Box sx={{ overflow: "auto" }}>
                      <List dense>
                        {[
                          "LOCAL",
                          "REMOTE",
                          "TAGS",
                          "STASHES",
                          "SUBMODULES",
                        ].map((text, index) => (
                          <ListItem
                            key={text}
                            secondaryAction={
                              <ArrowForwardIos sx={{ fontSize: "medium" }} />
                            }
                            disableGutters
                          >
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              {index % 2 === 0 ? <Inbox /> : <Mail />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Drawer>
                </Box>
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                  }}
                >
                  <Toolbar />
                  <Typography paragraph>
                    Loading Repo from {tab.repoPath}
                  </Typography>
                </Box>
              </>
            ) : (
              <Box
                component="main"
                sx={{
                  display: "flex",
                  height: "100vh",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ color: "white" }}
                    onClick={() => openModal()}
                  >
                    Create Repo
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ color: "white" }}
                  >
                    Clone Repo
                  </Button>
                </Stack>
              </Box>
            )}
          </TabPanel>
        ))}
      </Box>
      <SimpleDialog title="Repository" open={showModal} onClose={closeModal}>
        <Typography>Test modal</Typography>
      </SimpleDialog>
    </ThemeProvider>
  );
}

export default App;
