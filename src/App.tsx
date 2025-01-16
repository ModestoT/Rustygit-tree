import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Stack,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import './App.css';
import { ReactElement, ReactNode, SyntheticEvent, useState } from 'react';
import SimpleDialog from './Modal';
import RepoView from './RepoView';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

interface StyledTabsProps {
  children?: ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  scrollButtons?: boolean | 'auto';
  variant?: 'scrollable' | 'standard' | 'fullWidth';
}

interface StyledTabProps {
  label: string | ReactNode;
  icon?: ReactElement;
  iconPosition?: 'bottom' | 'start' | 'end';
  value: number;
}

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

export interface RepoBranch {
  name: string;
  branch_type: 'Local' | 'Remote';
  is_checked_out: boolean;
}

export interface RepoTab {
  id: number;
  name: string;
  repoPath?: string;
  branchNames: RepoBranch[];
}

type RepoInitType = 'Open' | 'Clone' | 'Create';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ display: 'flex' }}>{children}</Box>}
    </div>
  );
};
const StyledTabs = styled((props: StyledTabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className='MuiTabs-indicatorSpan' /> }}
  />
))({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    width: '100%',
    backgroundColor: '#635ee7',
  },
});

const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#fff',
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
}));

const App = () => {
  const [selectedTab, setSelectedTab] = useState(1);
  const [repoInitType, setRepoInitType] = useState<RepoInitType>('Open');
  const [showModal, setShowModal] = useState(false);
  const [tabs, setTabs] = useState<RepoTab[]>([
    { id: 1, name: 'New Tab', branchNames: [] },
  ]);

  const handleSelectedTab = (_: SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const addNewTab = () =>
    setTabs([
      ...tabs,
      {
        id: tabs.length + 1,
        name: 'New Tab',
        branchNames: [],
      },
    ]);
  const deleteTab = (event: SyntheticEvent, tab: RepoTab) => {
    event.stopPropagation();

    const tabsCopy = [...tabs];
    const foundindex = tabsCopy.findIndex((x) => x.id === tab.id);

    if (foundindex === -1) return;

    tabsCopy.splice(foundindex, 1);

    setTabs(tabsCopy);

    if (tab.id === selectedTab) {
      setSelectedTab(tabsCopy[tabsCopy.length - 1].id);
    }
  };

  const openModal = (type: RepoInitType) => {
    setShowModal(true);
    setRepoInitType(type);
  };

  const closeModal = () => setShowModal(false);

  const openFileBrowser = async (tabId: number) => {
    const selectedFolder = await open({
      multiple: false,
      directory: true,
    });

    if (!Array.isArray(selectedFolder) && selectedFolder !== null) {
      const returnedValue: RepoBranch[] = await invoke('open_repo', {
        path: selectedFolder,
      });
      const tabsCopy = [...tabs];
      const foundIndex = tabsCopy.findIndex((x) => x.id === tabId);

      tabsCopy[foundIndex].branchNames = returnedValue;
      tabsCopy[foundIndex].repoPath = selectedFolder;
      tabsCopy[foundIndex].name = selectedFolder.split('\\').pop() ?? '';

      setTabs(tabsCopy);
    }
  };
  return (
    <ThemeProvider theme={darkTheme}>
      <Box>
        <AppBar
          position='fixed'
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <Typography>RustyGitTree</Typography>
            <StyledTabs
              value={selectedTab}
              onChange={handleSelectedTab}
              scrollButtons='auto'
              variant='scrollable'
            >
              {tabs.map((x) => (
                <StyledTab
                  value={x.id}
                  key={x.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>{x.name}</Typography>
                      {tabs.length !== 1 ? (
                        <Close
                          className='closeButton'
                          fontSize='inherit'
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
              <RepoView repo={tab} />
            ) : (
              <Box
                component='main'
                sx={{
                  display: 'flex',
                  height: '100vh',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Stack spacing={2}>
                  <Button
                    variant='outlined'
                    color='secondary'
                    sx={{ color: 'white' }}
                    onClick={() => openFileBrowser(tab.id)}
                  >
                    Open Repo
                  </Button>
                  <Button
                    variant='outlined'
                    color='secondary'
                    sx={{ color: 'white' }}
                    onClick={() => openModal('Clone')}
                  >
                    Clone Repo
                  </Button>

                  <Button
                    variant='outlined'
                    color='secondary'
                    sx={{ color: 'white' }}
                    onClick={() => openModal('Create')}
                  >
                    Create Repo
                  </Button>
                </Stack>
              </Box>
            )}
          </TabPanel>
        ))}
      </Box>
      <SimpleDialog title='Repository' open={showModal} onClose={closeModal}>
        <Typography>{repoInitType}</Typography>
      </SimpleDialog>
    </ThemeProvider>
  );
};

export default App;
