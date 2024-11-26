import {
  Box,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';

import {
  SellOutlined,
  CloudOutlined,
  ArrowForwardIos,
  AccountTreeOutlined,
  Inventory2Outlined,
  ViewModuleOutlined,
  CheckCircleOutline,
} from '@mui/icons-material';
import { RepoBranch, RepoTab } from './App';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api';

const drawerWidth = 180;
const navSections = [
  {
    label: 'Local',
    icon: AccountTreeOutlined,
  },
  {
    label: 'Remote',
    icon: CloudOutlined,
  },
  {
    label: 'Tags',
    icon: SellOutlined,
  },
  {
    label: 'Stashes',
    icon: Inventory2Outlined,
  },
  {
    label: 'Submodules',
    icon: ViewModuleOutlined,
  },
] as const;

type NavSections = (typeof navSections)[number];

interface RepoViewProps {
  repo: RepoTab;
}
interface Commit {
  id: string;
  message: string;
  author: string;
}

const BranchLabel = (props: {
  branch: RepoBranch;
  section: NavSections['label'];
  selected: boolean;
  onClick: () => void;
}) => {
  const { branch, section, selected, onClick } = props;

  return section === branch.branch_type ? (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      sx={{ paddingLeft: '6px' }}
    >
      {selected ? <CheckCircleOutline color='success' /> : null}
      <ListItemText sx={{ paddingLeft: '5px' }}>{branch.name}</ListItemText>
    </ListItemButton>
  ) : null;
};

const RepoView = (props: RepoViewProps) => {
  const { repo } = props;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [branchCommits, setBranchCommits] = useState<Commit[]>([]);

  useEffect(() => {
    repo.branchNames.every((branch, index) => {
      if (!branch.is_checked_out) return true;

      setSelectedIndex(index);
      return false;
    });
    invoke('get_commit_history').then((result) => {
      setBranchCommits(result as Commit[]);
    });
  }, []);

  return (
    <>
      <Box
        component='nav'
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', sm: 'block' },
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List dense>
              {navSections.map((section) => (
                <ListItem
                  key={section.label}
                  disableGutters
                  sx={{ flexDirection: 'column' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <section.icon />
                    </ListItemIcon>
                    <ListItemText primary={section.label.toUpperCase()} />
                    <ArrowForwardIos sx={{ fontSize: 'medium' }} />
                  </div>
                  <div style={{ width: '100%' }}>
                    <List>
                      {repo.branchNames.map((branch, branchIndex) => (
                        <BranchLabel
                          key={branchIndex}
                          branch={branch}
                          section={section.label}
                          selected={selectedIndex === branchIndex}
                          onClick={() => setSelectedIndex(branchIndex)}
                        />
                      ))}
                    </List>
                  </div>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </Box>
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {branchCommits.map((commit, idx) => (
          <Box sx={{ display: 'flex' }} key={idx}>
            <Typography>{commit.author}</Typography>
            <Typography>{commit.message}</Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default RepoView;
