import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type Role = 'admin' | 'customer';
export interface User {
    email: string,
    password: string,
    role: Role,
    name?: string
}
@Injectable({providedIn : 'root'})
export class AuthService{
    private users: User[] = [
        {
            email:'kamlesh@example.com',
            password:'password',
            role:'admin',
            name:'Kamlesh'
        },
        {
            email:'logesh@example.com',
            password:'password',
            role:'admin',
            name:'Logesh'
        },
        {
            email:'hari@example.com',
            password:'password',
            role:'customer',
            name:'Hari'
        },
        {
            email:'tejal@example.com',
            password:'password',
            role:'customer',
            name:'Tejal'
        },
        {
            email:'sruthi@example.com',
            password:'password',
            role:'customer',
            name:'Sruthi'
        },
        {
            email:'shree@example.com',
            password:'password',
            role:'customer',
            name:'Shree'
        }   
    ];
    private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
    currentUser$ = this.currentUserSubject.asObservable();
    login(email: string, password: string) : User | null{
        const user = this.users.find(
            u => u.email === email && u.password === password
        );
        if (user) {
            localStorage.setItem('auth_user', JSON.stringify(user));
            this.currentUserSubject.next(user);
            return user;
        }
        return null;
    }
    logout(){
        localStorage.removeItem('auth_user');
        this.currentUserSubject.next(null);

    }
    getStoredUser(): User | null{
        try{
            return JSON.parse(localStorage.getItem('auth_user') || 'null')
        } catch{
            return null;
        }
    }
    isLoggedIn(): boolean{
        return !!this.getStoredUser();
    }
    hasRole(roles: Role[]): boolean{
        const u = this.getStoredUser();
        return !!u && roles.includes(u.role);
    }
}