import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id?: number;
  email?: string;
}

export interface Company {
  id?: number;
  name?: string;
  industry?: string;
  description?: string;
  logo_url?: string;
}

interface UserCompanyState {
  user: User;
  company: Company;
  token: string;
}

const initialState: UserCompanyState = {
  user: {},
  company: {},
  token: '',
};

const userCompanySlice = createSlice({
  name: 'userCompany',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setCompany(state, action: PayloadAction<Company>) {
      state.company = action.payload;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    logout(state) {
      state.user = {};
      state.company = {};
      state.token = '';
    },
  },
});

export const { setUser, setCompany, setToken, logout } = userCompanySlice.actions;
export default userCompanySlice.reducer; 