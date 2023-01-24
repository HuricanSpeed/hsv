import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-joke',
  templateUrl: './joke.component.html',
  styleUrls: ['./joke.component.css']
})
export class JokeComponent implements OnInit {

  joke: any;
  clicked: boolean = false;

  constructor(private http: HttpService) { }

  ngOnInit(): void {
    this.getJoke();
  }

  getJoke(){
    this.http.getJoke().subscribe(data => {
      this.joke = data;
    })
    this.clicked = false;
  }

  showAnswer(){
    this.clicked = !this.clicked;
  }

}